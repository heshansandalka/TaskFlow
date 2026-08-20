import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

/**
 * Joins the board's socket room and applies incoming events to local state,
 * so every active user sees changes instantly without reloading.
 */
export function useBoardRealtime(boardId, handlers) {
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket || !boardId) return;

    socket.emit("board:join", { boardId });

    socket.on("task:created", handlers.onTaskCreated);
    socket.on("task:updated", handlers.onTaskUpdated);
    socket.on("task:moved", handlers.onTaskMoved);
    socket.on("task:deleted", handlers.onTaskDeleted);
    socket.on("list:created", handlers.onListCreated);
    socket.on("list:updated", handlers.onListUpdated);
    socket.on("list:deleted", handlers.onListDeleted);
    socket.on("board:updated", handlers.onBoardUpdated);

    return () => {
      socket.emit("board:leave", { boardId });
      socket.off("task:created", handlers.onTaskCreated);
      socket.off("task:updated", handlers.onTaskUpdated);
      socket.off("task:moved", handlers.onTaskMoved);
      socket.off("task:deleted", handlers.onTaskDeleted);
      socket.off("list:created", handlers.onListCreated);
      socket.off("list:updated", handlers.onListUpdated);
      socket.off("list:deleted", handlers.onListDeleted);
      socket.off("board:updated", handlers.onBoardUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, boardId]);

  return { connected };
}
