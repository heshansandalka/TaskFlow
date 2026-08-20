import { useState } from "react";
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
import { boardsApi } from "../../api/boards";
import { useToast } from "../../context/ToastContext";

export default function InviteMemberModal({ open, onClose, board, onUpdated }) {
  const { notify } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [inviting, setInviting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    try {
      const updated = await boardsApi.inviteMember(board._id, email.trim(), role);
      onUpdated(updated);
      notify(`Invited ${email} as ${role}`, { type: "success" });
      setEmail("");
    } catch (err) {
      notify(err.response?.data?.message || "Couldn't invite that person", { type: "error" });
    } finally {
      setInviting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6">
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Board members
        </h2>

        <div className="mb-5 space-y-1.5">
          {board.members?.map((m) => (
            <div key={m.user._id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
              <Avatar name={m.user.name} size="sm" />
              <span className="flex-1 truncate text-sm">{m.user.name}</span>
              <span className="text-xs capitalize text-mist-100/40">{m.role}</span>
              {m.role !== "admin" && (
                <button
                  onClick={async () => {
                    const updated = await boardsApi.removeMember(board._id, m.user._id);
                    onUpdated(updated);
                  }}
                  className="text-mist-100/30 hover:text-accent-rose"
                  aria-label={`Remove ${m.user.name}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@email.com"
            className="input-field text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-field w-28 text-sm"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={inviting} className="btn-primary px-4 text-sm">
            Invite
          </button>
        </form>
      </div>
    </Modal>
  );
}
