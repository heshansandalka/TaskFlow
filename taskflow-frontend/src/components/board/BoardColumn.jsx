import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

export default function BoardColumn({
  list,
  tasks,
  onOpenTask,
  onAddTask,
  onRenameList,
  onDeleteList,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: list._id, data: { type: "list" } });
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(list.title);

  const submitTask = (e) => {
    e.preventDefault();
    if (!draft.trim()) return setAdding(false);
    onAddTask(list._id, draft.trim());
    setDraft("");
  };

  const submitTitle = () => {
    setEditingTitle(false);
    if (titleDraft.trim() && titleDraft !== list.title) {
      onRenameList(list._id, titleDraft.trim());
    } else {
      setTitleDraft(list.title);
    }
  };

  return (
    <div className="flex h-full w-72 shrink-0 flex-col rounded-xl2">
      <div className="mb-2 flex items-center justify-between px-1">
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={submitTitle}
            onKeyDown={(e) => e.key === "Enter" && submitTitle()}
            className="input-field py-1 text-sm font-semibold"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="flex items-center gap-2 text-left font-display text-sm font-semibold tracking-tight"
          >
            {list.title}
            <span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[11px] font-normal text-mist-100/60">
              {tasks.length}
            </span>
          </button>
        )}
        <button
          onClick={() => onDeleteList(list._id)}
          className="text-mist-100/30 hover:text-accent-rose"
          aria-label={`Delete ${list.title} list`}
        >
          ✕
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`glass-panel flex flex-1 flex-col gap-2 overflow-y-auto p-2.5 transition-colors ${
          isOver ? "ring-1 ring-brand-400/60" : ""
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onOpen={onOpenTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !adding && (
          <p className="px-1 py-6 text-center text-xs text-mist-100/30">
            Drop a card here
          </p>
        )}

        {adding ? (
          <form onSubmit={submitTask} className="space-y-2">
            <textarea
              autoFocus
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) submitTask(e);
                if (e.key === "Escape") setAdding(false);
              }}
              placeholder="Task title…"
              className="input-field resize-none text-sm"
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1 py-1.5 text-xs">
                Add card
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="btn-ghost py-1.5 text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="btn-ghost justify-start py-1.5 text-sm text-mist-100/50"
          >
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
}
