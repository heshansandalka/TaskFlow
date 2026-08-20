import Avatar from "../ui/Avatar";

export default function BoardHeader({ board, connected, onInviteClick }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {board.title}
        </h1>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-mist-100/40">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              connected ? "bg-accent-teal" : "bg-mist-100/30"
            }`}
          />
          {connected ? "Live — updates sync instantly" : "Reconnecting…"}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {board.members?.slice(0, 5).map((m) => (
            <Avatar key={m.user._id} name={m.user.name} ring />
          ))}
        </div>
        <button onClick={onInviteClick} className="btn-ghost text-sm">
          + Invite
        </button>
      </div>
    </div>
  );
}
