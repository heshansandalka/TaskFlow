import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../NotificationBell";

export default function Topbar({ search, onSearchChange, filters, onFilterChange }) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <header className="glass-panel mb-4 flex items-center gap-3 px-4 py-3">
      <div className="relative flex-1 max-w-sm">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-100/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
          />
        </svg>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks, labels, people…"
          className="input-field pl-9 text-sm"
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setFilterOpen((v) => !v)}
          className="btn-ghost text-sm"
        >
          Filter
          {filters?.length > 0 && (
            <span className="rounded-full bg-brand-500 px-1.5 text-[10px] font-semibold text-white">
              {filters.length}
            </span>
          )}
        </button>
        {filterOpen && (
          <div className="glass-panel absolute right-0 top-full z-20 mt-2 w-48 p-2">
            {["Assigned to me", "Due this week", "Overdue", "High priority"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => onFilterChange(f)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/[0.06] ${
                    filters?.includes(f) ? "text-brand-400" : ""
                  }`}
                >
                  {f}
                </button>
              )
            )}
          </div>
        )}
      </div>

      <NotificationBell />

      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="btn-ghost h-9 w-9 !px-0"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <button onClick={logout} className="btn-ghost text-sm">
        Log out
      </button>
    </header>
  );
}
