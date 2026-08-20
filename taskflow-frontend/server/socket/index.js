import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../middleware/auth.js";

let ioInstance = null;

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
    transports: ["websocket", "polling"],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
    if (!token) return next();
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
    } catch (err) {
      // Allow socket connection even if auth token fails, but userId won't be set
    }
    next();
  });

  io.on("connection", (socket) => {
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.on("board:join", ({ boardId }) => {
      if (boardId) socket.join(`board:${boardId}`);
    });

    socket.on("board:leave", ({ boardId }) => {
      if (boardId) socket.leave(`board:${boardId}`);
    });

    socket.on("disconnect", () => {});
  });

  ioInstance = io;
  return io;
};

export const getIO = () => {
  return ioInstance;
};

export const emitToBoard = (boardId, event, data) => {
  if (ioInstance && boardId) {
    ioInstance.to(`board:${boardId}`).emit(event, data);
  }
};

export const emitToUser = (userId, event, data) => {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit(event, data);
  }
};
