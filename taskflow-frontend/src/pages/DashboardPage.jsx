import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import CreateBoardModal from "../components/board/CreateBoardModal";
import { boardsApi } from "../api/boards";

export default function DashboardPage() {
  const [boards, setBoards] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    boardsApi.getAll().then(setBoards);
  }, [refreshKey]);

  if (boards === null) return null;
  if (boards.length > 0) return <Navigate to={`/boards/${boards[0]._id}`} replace />;

  return (
    <div className="flex h-screen gap-4 bg-aurora bg-fixed p-4">
      <Sidebar onCreateBoard={() => setShowCreate(true)} refreshKey={refreshKey} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar search="" onSearchChange={() => {}} filters={[]} onFilterChange={() => {}} />

        <div className="glass-panel flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-2xl">
            🗂️
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              No boards yet
            </h2>
            <p className="mt-1 text-sm text-mist-100/50">
              Create a board to start organizing your team's work.
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            + Create your first board
          </button>
        </div>
      </div>

      <CreateBoardModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
