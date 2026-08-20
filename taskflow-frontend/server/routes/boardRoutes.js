import express from "express";
import {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  inviteMember,
  removeMember,
  createList,
  updateList,
  removeList,
  reorderLists,
} from "../controllers/boardController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getBoards);
router.post("/", createBoard);
router.get("/:boardId", getBoardById);
router.patch("/:boardId", updateBoard);
router.delete("/:boardId", deleteBoard);

// Board Members
router.post("/:boardId/members", inviteMember);
router.delete("/:boardId/members/:userId", removeMember);

// Board Lists
router.post("/:boardId/lists", createList);
router.patch("/:boardId/lists/reorder", reorderLists);
router.patch("/:boardId/lists/:listId", updateList);
router.delete("/:boardId/lists/:listId", removeList);

export default router;
