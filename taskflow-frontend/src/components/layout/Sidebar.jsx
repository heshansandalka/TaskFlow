import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { boardsApi } from "../../api/boards";
import Avatar from "../ui/Avatar";
import { useAuth } from "../../context/AuthContext";

const BOARD_COLORS = ["bg-brand-500", "bg-accent-teal", "bg-accent-amber", "bg-accent-rose"];

export default function Sidebar({ onCreateBoard, refreshKey }) {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    boardsApi
      .getAll()
      .then(setBoards)
      .catch(() => setBoards([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <aside className="glass-panel flex h-full w-64 shrink-0 flex-col p-4">
      <div className="mb-6 flex items-center gap-2 px-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient font-display font-bold text-white">
          T
        </div>
        <span className="font-display text-lg font-semibold tracking-tight">
          TaskFlow
        </span>
      </div>

      <button onClick={onCreateBoard} className="btn-primary mb-5 w-full text-sm">
        <span className="text-base leading-none">+</span> New board
      </button>

      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-mist-100/40">
        Your boards
      </p>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-white/5" />
          ))}

        {!loading && boards.length === 0 && (
          <p className="px-1 py-4 text-sm text-mist-100/40">
            No boards yet — create your first one.
          </p>
        )}

        {boards.map((board, i) => (
          <NavLink
            key={board._id}
            to={`/boards/${board._id}`}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-500/15 text-brand-400"
                  : "text-mist-100/70 hover:bg-white/[0.05] hover:text-mist-100"
              }`
            }
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${BOARD_COLORS[i % BOARD_COLORS.length]}`}
            />
            <span className="truncate">{board.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 flex items-center gap-2.5 border-t border-white/[0.06] pt-4">
        <Avatar name={user?.name || "You"} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-mist-100/40">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
}
