import express from "express";
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  assignUser,
  addComment,
  toggleChecklistItem,
} from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// Tasks by List
router.post("/lists/:listId/tasks", createTask);

// Task Endpoints
router.patch("/tasks/:taskId", updateTask);
router.delete("/tasks/:taskId", deleteTask);
router.patch("/tasks/:taskId/move", moveTask);
router.patch("/tasks/:taskId/assign", assignUser);
router.post("/tasks/:taskId/comments", addComment);
router.patch("/tasks/:taskId/checklist/:itemId", toggleChecklistItem);

export default router;
