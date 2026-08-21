import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import BoardHeader from "../components/board/BoardHeader";
import BoardColumn from "../components/board/BoardColumn";
import TaskCard from "../components/board/TaskCard";
import TaskModal from "../components/board/TaskModal";
import CreateBoardModal from "../components/board/CreateBoardModal";
import InviteMemberModal from "../components/board/InviteMemberModal";

import { boardsApi } from "../api/boards";
import { tasksApi } from "../api/tasks";
import { useBoardRealtime } from "../hooks/useBoardRealtime";
import { useToast } from "../context/ToastContext";

export default function BoardPage() {
  const { boardId } = useParams();
  const { notify } = useToast();

  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasksByList, setTasksByList] = useState({});
  const [loading, setLoading] = useState(true);

  const [activeTask, setActiveTask] = useState(null); // for drag overlay
  const [openTask, setOpenTask] = useState(null); // for detail modal
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const loadBoard = useCallback(() => {
    setLoading(true);
    boardsApi
      .getOne(boardId)
      .then((data) => {
        setBoard(data.board);
        setLists(data.lists);
        const byList = {};
        data.lists.forEach((l) => (byList[l._id] = data.tasks[l._id] || []));
        setTasksByList(byList);
      })
      .finally(() => setLoading(false));
  }, [boardId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // --- Real-time sync -------------------------------------------------
  const { connected } = useBoardRealtime(boardId, {
    onTaskCreated: (payload) => {
      const task = payload?.task || payload;
      const listId = payload?.listId || task?.list;
      if (!listId || !task?._id) return;
      setTasksByList((prev) => {
        const current = prev[listId] || [];
        if (current.some((t) => t._id === task._id)) {
          return {
            ...prev,
            [listId]: current.map((t) => (t._id === task._id ? task : t)),
          };
        }
        return { ...prev, [listId]: [...current, task] };
      });
    },
    onTaskUpdated: (payload) => {
      const task = payload?.task || payload;
      if (!task?._id) return;
      setTasksByList((prev) => {
        const next = { ...prev };
        for (const listId of Object.keys(next)) {
          next[listId] = next[listId].map((t) => (t._id === task._id ? task : t));
        }
        return next;
      });
    },
    onTaskMoved: ({ taskId, fromListId, toListId, toIndex, task } = {}) => {
      if (!taskId || !fromListId || !toListId) return;
      setTasksByList((prev) => {
        const next = { ...prev };
        next[fromListId] = (next[fromListId] || []).filter((t) => t._id !== taskId);
        const target = [...(next[toListId] || []).filter((t) => t._id !== taskId)];
        target.splice(toIndex, 0, task);
        next[toListId] = target;
        return next;
      });
    },
    onTaskDeleted: ({ taskId, listId } = {}) => {
      if (!taskId || !listId) return;
      setTasksByList((prev) => ({
        ...prev,
        [listId]: (prev[listId] || []).filter((t) => t._id !== taskId),
      }));
    },
    onListCreated: (payload) => {
      const list = payload?.list || payload;
      if (!list?._id) return;
      setLists((prev) => {
        if (prev.some((l) => l._id === list._id)) return prev;
        return [...prev, list];
      });
      setTasksByList((prev) => ({ ...prev, [list._id]: prev[list._id] || [] }));
    },
    onListUpdated: (payload) => {
      const list = payload?.list || payload;
      if (!list?._id) return;
      setLists((prev) => prev.map((l) => (l._id === list._id ? list : l)));
    },
    onListDeleted: (payload) => {
      const listId = payload?.listId || payload;
      if (!listId) return;
      setLists((prev) => prev.filter((l) => l._id !== listId));
      setTasksByList((prev) => {
        const next = { ...prev };
        delete next[listId];
        return next;
      });
    },
    onBoardUpdated: (payload) => {
      const b = payload?.board || payload;
      if (b?._id) setBoard(b);
    },
  });

  // --- Filtering / search ----------------------------------------------
  const visibleTasksByList = useMemo(() => {
    if (!search && activeFilters.length === 0) return tasksByList;
    const q = search.toLowerCase();
    const out = {};
    for (const [listId, tasks] of Object.entries(tasksByList)) {
      out[listId] = tasks.filter((t) => {
        const matchesSearch =
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.labels?.some((l) => l.name.toLowerCase().includes(q)) ||
          t.assignees?.some((a) => a.name.toLowerCase().includes(q));

        const matchesFilters = activeFilters.every((f) => {
          if (f === "Overdue") return t.dueDate && new Date(t.dueDate) < new Date();
          if (f === "Due this week")
            return (
              t.dueDate &&
              new Date(t.dueDate) >= new Date() &&
              new Date(t.dueDate) <= new Date(Date.now() + 7 * 86400000)
            );
          if (f === "High priority") return t.labels?.some((l) => l.name === "Urgent");
          return true; // "Assigned to me" resolved server-side normally
        });

        return matchesSearch && matchesFilters;
      });
    }
    return out;
  }, [tasksByList, search, activeFilters]);

  // --- Task/list mutations ----------------------------------------------
 const handleAddTask = async (listId, title) => {
  const optimistic = { _id: `tmp-${Date.now()}`, title, labels: [], assignees: [], checklist: [] };
  setTasksByList((prev) => ({ ...prev, [listId]: [...(prev[listId] || []), optimistic] }));
  try {
    const task = await tasksApi.create(listId, { title });
    setTasksByList((prev) => {
      const current = prev[listId] || [];
      // real task  list  (real‑time event add)
      if (current.some(t => t._id === task._id)) {
        // optimistic
        return {
          ...prev,
          [listId]: current.filter(t => t._id !== optimistic._id)
        };
      }
      //  optimistic  real  replace 
      return {
        ...prev,
        [listId]: current.map((t) => (t._id === optimistic._id ? task : t))
      };
    });
  } catch {
    notify("Couldn't add that card — try again.", { type: "error" });
    setTasksByList((prev) => ({
      ...prev,
      [listId]: (prev[listId] || []).filter((t) => t._id !== optimistic._id),
    }));
  }
};

  const handleTaskUpdated = (task) => {
    setTasksByList((prev) => {
      const next = { ...prev };
      for (const listId of Object.keys(next)) {
        next[listId] = next[listId].map((t) => (t._id === task._id ? task : t));
      }
      return next;
    });
    setOpenTask(task);
  };

  const handleTaskDeleted = async (taskId) => {
    await tasksApi.remove(taskId);
    setTasksByList((prev) => {
      const next = {};
      for (const [listId, tasks] of Object.entries(prev)) {
        next[listId] = tasks.filter((t) => t._id !== taskId);
      }
      return next;
    });
    setOpenTask(null);
  };

  const handleCreateListSubmit = async (e) => {
    if (e) e.preventDefault();
    const title = newListTitle.trim();
    if (!title) return;

    setIsCreatingList(true);
    try {
      const list = await boardsApi.createList(boardId, { title });
      setLists((prev) => {
        if (prev.some((l) => l._id === list._id)) return prev;
        return [...prev, list];
      });
      setTasksByList((prev) => ({ ...prev, [list._id]: prev[list._id] || [] }));
      setNewListTitle("");
      setAddingList(false);
    } catch {
      notify("Couldn't add list — try again.", { type: "error" });
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleRenameList = async (listId, title) => {
    const list = await boardsApi.updateList(boardId, listId, { title });
    setLists((prev) => prev.map((l) => (l._id === listId ? list : l)));
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm("Delete this list and all its cards?")) return;
    await boardsApi.removeList(boardId, listId);
    setLists((prev) => prev.filter((l) => l._id !== listId));
  };

  // --- Drag and drop ------------------------------------------------------
  const findContainer = (id) => {
    if (tasksByList[id]) return id;
    return Object.keys(tasksByList).find((listId) =>
      tasksByList[listId].some((t) => t._id === id)
    );
  };

  const onDragStart = (event) => {
    const { active } = event;
    const containerId = findContainer(active.id);
    const task = tasksByList[containerId]?.find((t) => t._id === active.id);
    setActiveTask(task || null);
  };

  const onDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setTasksByList((prev) => {
      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];
      const activeIndex = activeItems.findIndex((t) => t._id === active.id);
      const [moved] = activeItems.splice(activeIndex, 1);
      const overIndex = overItems.findIndex((t) => t._id === over.id);
      overItems.splice(overIndex >= 0 ? overIndex : overItems.length, 0, moved);
      return { ...prev, [activeContainer]: activeItems, [overContainer]: overItems };
    });
  };

  const onDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    if (!activeContainer || !overContainer) return;

    let newIndex;
    if (activeContainer === overContainer) {
      const items = tasksByList[activeContainer];
      const oldIndex = items.findIndex((t) => t._id === active.id);
      newIndex = items.findIndex((t) => t._id === over.id);
      if (oldIndex !== newIndex && newIndex !== -1) {
        setTasksByList((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(items, oldIndex, newIndex),
        }));
      }
    } else {
      newIndex = tasksByList[overContainer].findIndex((t) => t._id === active.id);
    }

    try {
      await tasksApi.move(active.id, {
        toListId: overContainer,
        toIndex: newIndex < 0 ? 0 : newIndex,
      });
    } catch {
      notify("Move didn't save — reloading board.", { type: "error" });
      loadBoard();
    }
  };

  if (loading || !board) {
    return (
      <div className="flex h-screen items-center justify-center bg-aurora bg-fixed">
        <p className="text-sm text-mist-100/40">Loading board…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen gap-4 bg-aurora bg-fixed p-4">
      <Sidebar onCreateBoard={() => setShowCreateBoard(true)} refreshKey={sidebarRefresh} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          search={search}
          onSearchChange={setSearch}
          filters={activeFilters}
          onFilterChange={(f) =>
            setActiveFilters((prev) =>
              prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
            )
          }
        />

        <BoardHeader board={board} connected={connected} onInviteClick={() => setShowInvite(true)} />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="flex flex-1 gap-4 overflow-x-auto pb-2">
            <SortableContext items={lists.map((l) => l._id)} strategy={horizontalListSortingStrategy}>
              {lists.map((list) => (
                <BoardColumn
                  key={list._id}
                  list={list}
                  tasks={visibleTasksByList[list._id] || []}
                  onOpenTask={setOpenTask}
                  onAddTask={handleAddTask}
                  onRenameList={handleRenameList}
                  onDeleteList={handleDeleteList}
                />
              ))}
            </SortableContext>

            {addingList ? (
              <form
                onSubmit={handleCreateListSubmit}
                className="glass-panel flex h-fit w-72 shrink-0 flex-col gap-2 p-3"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Enter list title..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setAddingList(false);
                      setNewListTitle("");
                    }
                  }}
                  className="input-field text-sm"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isCreatingList || !newListTitle.trim()}
                    className="btn-primary py-1.5 px-3 text-xs"
                  >
                    {isCreatingList ? "Adding..." : "Add list"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingList(false);
                      setNewListTitle("");
                    }}
                    className="btn-ghost py-1.5 px-2 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setAddingList(true)}
                className="btn-ghost h-fit w-64 shrink-0 justify-start border border-dashed border-white/10 py-2.5 text-sm text-mist-100/40"
              >
                + Add another list
              </button>
            )}
          </div>

          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} onOpen={() => {}} />}
          </DragOverlay>
        </DndContext>
      </div>

      {openTask && (
        <TaskModal
          task={openTask}
          members={(board.members || []).map((m) => m.user)}
          onClose={() => setOpenTask(null)}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}

      <CreateBoardModal
        open={showCreateBoard}
        onClose={() => setShowCreateBoard(false)}
        onCreated={() => setSidebarRefresh((k) => k + 1)}
      />

      <InviteMemberModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        board={board}
        onUpdated={setBoard}
      />
    </div>
  );
}
