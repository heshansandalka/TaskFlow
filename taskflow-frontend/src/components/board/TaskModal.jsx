import { useEffect, useState } from "react";
import { format } from "date-fns";
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import { tasksApi } from "../../api/tasks";
import { useAuth } from "../../context/AuthContext";

const LABEL_OPTIONS = [
  { name: "Bug", color: "rose" },
  { name: "Feature", color: "brand" },
  { name: "Design", color: "teal" },
  { name: "Urgent", color: "amber" },
];

export default function TaskModal({ task, members, onClose, onUpdated, onDeleted }) {
  const { user } = useAuth();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState(
    task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""
  );
  const [checklist, setChecklist] = useState(task.checklist || []);
  const [newItem, setNewItem] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(task.comments || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setChecklist(task.checklist || []);
    setComments(task.comments || []);
  }, [task._id]);

  const persist = async (patch) => {
    setSaving(true);
    try {
      const updated = await tasksApi.update(task._id, patch);
      onUpdated(updated);
    } finally {
      setSaving(false);
    }
  };

  const toggleLabel = (label) => {
    const has = (task.labels || []).some((l) => l.name === label.name);
    const labels = has
      ? task.labels.filter((l) => l.name !== label.name)
      : [...(task.labels || []), label];
    persist({ labels });
  };

  const toggleAssignee = (member) => {
    const has = (task.assignees || []).some((a) => a._id === member._id);
    const assigneeIds = has
      ? task.assignees.filter((a) => a._id !== member._id).map((a) => a._id)
      : [...(task.assignees || []).map((a) => a._id), member._id];
    persist({ assigneeIds });
  };

  const addChecklistItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const next = [...checklist, { _id: crypto.randomUUID(), text: newItem.trim(), done: false }];
    setChecklist(next);
    setNewItem("");
    persist({ checklist: next });
  };

  const toggleChecklistItem = (id) => {
    const next = checklist.map((c) => (c._id === id ? { ...c, done: !c.done } : c));
    setChecklist(next);
    persist({ checklist: next });
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const optimistic = {
      _id: crypto.randomUUID(),
      text: comment.trim(),
      author: { _id: user.id, name: user.name },
      createdAt: new Date().toISOString(),
    };
    setComments((c) => [...c, optimistic]);
    setComment("");
    try {
      const updated = await tasksApi.addComment(task._id, optimistic.text);
      onUpdated(updated);
    } catch {
      /* optimistic UI stays; server sync via socket will reconcile */
    }
  };

  return (
    <Modal open onClose={onClose} maxWidth="max-w-2xl">
      <div className="max-h-[85vh] overflow-y-auto p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && title !== task.title && persist({ title: title.trim() })}
            className="w-full bg-transparent font-display text-xl font-semibold tracking-tight
              focus:outline-none focus:ring-0 border-b border-transparent focus:border-brand-400/40 pb-1"
          />
          <button
            onClick={onClose}
            className="btn-ghost h-8 w-8 shrink-0 !px-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_180px]">
          <div className="space-y-6">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist-100/40">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => persist({ description })}
                placeholder="Add more detail…"
                className="input-field resize-none text-sm"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-mist-100/40">
                  Checklist
                </label>
                {checklist.length > 0 && (
                  <span className="text-xs text-mist-100/40">
                    {checklist.filter((c) => c.done).length}/{checklist.length}
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {checklist.map((item) => (
                  <label
                    key={item._id}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/[0.04]"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleChecklistItem(item._id)}
                      className="h-4 w-4 rounded accent-brand-500"
                    />
                    <span className={`text-sm ${item.done ? "text-mist-100/40 line-through" : ""}`}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
              <form onSubmit={addChecklistItem} className="mt-2 flex gap-2">
                <input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Add checklist item…"
                  className="input-field py-1.5 text-sm"
                />
                <button type="submit" className="btn-ghost px-3 text-sm">
                  Add
                </button>
              </form>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist-100/40">
                Comments
              </label>
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c._id} className="flex gap-2.5">
                    <Avatar name={c.author?.name || "?"} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">{c.author?.name}</span>
                        <span className="text-[11px] text-mist-100/35">
                          {c.createdAt ? format(new Date(c.createdAt), "MMM d, h:mm a") : ""}
                        </span>
                      </div>
                      <p className="text-sm text-mist-100/80">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={submitComment} className="mt-3 flex gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment… use @name to mention"
                  className="input-field py-1.5 text-sm"
                />
                <button type="submit" className="btn-primary px-3 py-1.5 text-sm">
                  Post
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist-100/40">
                Due date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  persist({ dueDate: e.target.value || null });
                }}
                className="input-field py-1.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist-100/40">
                Labels
              </label>
              <div className="flex flex-wrap gap-1.5">
                {LABEL_OPTIONS.map((l) => {
                  const active = (task.labels || []).some((x) => x.name === l.name);
                  return (
                    <button key={l.name} onClick={() => toggleLabel(l)}>
                      <Badge color={l.color} className={active ? "" : "opacity-35"}>
                        {l.name}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist-100/40">
                Assignees
              </label>
              <div className="space-y-1">
                {members.map((m) => {
                  const active = (task.assignees || []).some((a) => a._id === m._id);
                  return (
                    <button
                      key={m._id}
                      onClick={() => toggleAssignee(m)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm
                        ${active ? "bg-brand-500/15 text-brand-400" : "hover:bg-white/[0.05]"}`}
                    >
                      <Avatar name={m.name} size="sm" />
                      <span className="truncate">{m.name}</span>
                      {active && <span className="ml-auto">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => onDeleted(task._id)}
              className="btn-ghost w-full justify-start text-sm text-accent-rose/80 hover:text-accent-rose"
            >
              🗑 Delete card
            </button>

            {saving && <p className="text-xs text-mist-100/30">Saving…</p>}
          </div>
        </div>
      </div>
    </Modal>
  );
}
