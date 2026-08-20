import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useSocket } from "../context/SocketContext";

export default function NotificationBell() {
  const { socket } = useSocket();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const onAssigned = (payload) =>
      setItems((prev) => [{ id: crypto.randomUUID(), type: "assigned", ...payload, at: new Date() }, ...prev].slice(0, 30));
    const onDue = (payload) =>
      setItems((prev) => [{ id: crypto.randomUUID(), type: "due", ...payload, at: new Date() }, ...prev].slice(0, 30));
    const onMention = (payload) =>
      setItems((prev) => [{ id: crypto.randomUUID(), type: "mention", ...payload, at: new Date() }, ...prev].slice(0, 30));

    socket.on("notification:assigned", onAssigned);
    socket.on("notification:due-soon", onDue);
    socket.on("notification:mention", onMention);

    return () => {
      socket.off("notification:assigned", onAssigned);
      socket.off("notification:due-soon", onDue);
      socket.off("notification:mention", onMention);
    };
  }, [socket]);

  const unread = items.filter((i) => !i.read).length;

  const ICON = { assigned: "📌", due: "⏰", mention: "💬" };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) setItems((prev) => prev.map((i) => ({ ...i, read: true })));
        }}
        aria-label="Notifications"
        className="btn-ghost relative h-9 w-9 !px-0"
      >
        🔔
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-rose" />
        )}
      </button>

      {open && (
        <div className="glass-panel absolute right-0 top-full z-30 mt-2 max-h-96 w-80 overflow-y-auto p-2">
          <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-mist-100/40">
            Notifications
          </p>
          {items.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-mist-100/40">
              You're all caught up.
            </p>
          )}
          {items.map((n) => (
            <div
              key={n.id}
              className="flex gap-2.5 rounded-lg px-2 py-2.5 hover:bg-white/[0.05]"
            >
              <span className="text-base leading-none">{ICON[n.type]}</span>
              <div className="min-w-0">
                <p className="text-sm leading-snug">{n.message}</p>
                <p className="mt-0.5 text-xs text-mist-100/40">
                  {formatDistanceToNow(n.at, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
