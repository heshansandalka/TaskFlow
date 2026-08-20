import { useState } from "react";
import Modal from "../ui/Modal";
import { boardsApi } from "../../api/boards";

const PRESETS = [
  { title: "Product Sprint", lists: ["Backlog", "To Do", "Doing", "Done"] },
  { title: "Personal Tasks", lists: ["To Do", "In Progress", "Done"] },
  { title: "Blank board", lists: ["To Do", "Doing", "Done"] },
];

export default function CreateBoardModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [preset, setPreset] = useState(PRESETS[0]);
  const [creating, setCreating] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const board = await boardsApi.create({ title: title.trim(), lists: preset.lists });
      setTitle("");
      onCreated(board);
      onClose();
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={submit} className="p-6">
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Create a new board
        </h2>

        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist-100/40">
          Board name
        </label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Marketing Launch"
          className="input-field mb-4 text-sm"
        />

        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist-100/40">
          Starting template
        </label>
        <div className="mb-6 space-y-1.5">
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p.title}
              onClick={() => setPreset(p)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm
                ${preset.title === p.title ? "bg-brand-500/15 text-brand-400" : "hover:bg-white/[0.05]"}`}
            >
              <span>{p.title}</span>
              <span className="text-xs text-mist-100/40">{p.lists.join(" · ")}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={creating} className="btn-primary flex-1 text-sm">
            {creating ? "Creating…" : "Create board"}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost text-sm">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
