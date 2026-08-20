import Board from "../models/Board.js";
import List from "../models/List.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { emitToBoard, emitToUser } from "../socket/index.js";

// @desc    Get all boards for logged in user
// @route   GET /api/boards
export const getBoards = async (req, res) => {
  try {
    const userId = req.user._id;
    const boards = await Board.find({
      $or: [{ owner: userId }, { "members.user": userId }],
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .sort({ updatedAt: -1 });

    return res.json(boards);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single board details with lists and tasks grouped by list ID
// @route   GET /api/boards/:boardId
export const getBoardById = async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await Board.findById(boardId)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .populate("lists");

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const lists = await List.find({ board: boardId }).sort({ position: 1 });
    const tasks = await Task.find({ board: boardId })
      .populate("assignees", "name email avatar")
      .populate("comments.user", "name email avatar")
      .sort({ position: 1 });

    // Group tasks by list ID
    const tasksByList = {};
    lists.forEach((list) => {
      tasksByList[list._id.toString()] = tasks.filter(
        (t) => t.list.toString() === list._id.toString()
      );
    });

    return res.json({
      board,
      lists,
      tasks: tasksByList,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new board
// @route   POST /api/boards
export const createBoard = async (req, res) => {
  try {
    const { title, description, color } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Board title is required" });
    }

    const board = await Board.create({
      title,
      description: description || "",
      color: color || "bg-brand-500",
      owner: req.user._id,
      members: [{ user: req.user._id, role: "admin" }],
    });

    // Create default starter lists for a new board
    const defaultListTitles = ["To Do", "In Progress", "Done"];
    const createdLists = [];

    for (let i = 0; i < defaultListTitles.length; i++) {
      const list = await List.create({
        title: defaultListTitles[i],
        board: board._id,
        position: i,
      });
      createdLists.push(list._id);
    }

    board.lists = createdLists;
    await board.save();

    const populatedBoard = await Board.findById(board._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .populate("lists");

    return res.status(201).json(populatedBoard);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update a board
// @route   PATCH /api/boards/:boardId
export const updateBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description, color } = req.body;

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });

    if (title !== undefined) board.title = title;
    if (description !== undefined) board.description = description;
    if (color !== undefined) board.color = color;

    await board.save();

    const updated = await Board.findById(boardId)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .populate("lists");

    emitToBoard(boardId, "board:updated", { board: updated });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a board
// @route   DELETE /api/boards/:boardId
export const deleteBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });

    await Task.deleteMany({ board: boardId });
    await List.deleteMany({ board: boardId });
    await Board.findByIdAndDelete(boardId);

    return res.json({ message: "Board deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Invite member to board by email
// @route   POST /api/boards/:boardId/members
export const inviteMember = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { email, role } = req.body;

    const userToInvite = await User.findOne({ email: email.toLowerCase() });
    if (!userToInvite) {
      return res.status(404).json({ message: "User with this email not found" });
    }

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });

    const alreadyMember = board.members.some(
      (m) => m.user.toString() === userToInvite._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "User is already a member of this board" });
    }

    board.members.push({ user: userToInvite._id, role: role || "member" });
    await board.save();

    const updated = await Board.findById(boardId)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .populate("lists");

    emitToBoard(boardId, "board:updated", { board: updated });
    emitToUser(userToInvite._id.toString(), "notification:assigned", {
      message: `${req.user.name} added you to board "${board.title}"`,
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from board
// @route   DELETE /api/boards/:boardId/members/:userId
export const removeMember = async (req, res) => {
  try {
    const { boardId, userId } = req.params;
    const board = await Board.findById(boardId);

    if (!board) return res.status(404).json({ message: "Board not found" });

    board.members = board.members.filter((m) => m.user.toString() !== userId);
    await board.save();

    const updated = await Board.findById(boardId)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .populate("lists");

    emitToBoard(boardId, "board:updated", { board: updated });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create a list in a board
// @route   POST /api/boards/:boardId/lists
export const createList = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    if (!title) return res.status(400).json({ message: "List title is required" });

    const existingLists = await List.find({ board: boardId });
    const position = existingLists.length;

    const list = await List.create({
      title,
      board: boardId,
      position,
    });

    await Board.findByIdAndUpdate(boardId, { $push: { lists: list._id } });

    emitToBoard(boardId, "list:created", { list });

    return res.status(201).json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update a list
// @route   PATCH /api/boards/:boardId/lists/:listId
export const updateList = async (req, res) => {
  try {
    const { boardId, listId } = req.params;
    const { title } = req.body;

    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: "List not found" });

    if (title) list.title = title;
    await list.save();

    emitToBoard(boardId, "list:updated", { list });
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a list
// @route   DELETE /api/boards/:boardId/lists/:listId
export const removeList = async (req, res) => {
  try {
    const { boardId, listId } = req.params;

    await Task.deleteMany({ list: listId });
    await List.findByIdAndDelete(listId);
    await Board.findByIdAndUpdate(boardId, { $pull: { lists: listId } });

    emitToBoard(boardId, "list:deleted", { listId });
    return res.json({ message: "List deleted", listId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Reorder lists in a board
// @route   PATCH /api/boards/:boardId/lists/reorder
export const reorderLists = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { orderedListIds } = req.body;

    if (!Array.isArray(orderedListIds)) {
      return res.status(400).json({ message: "orderedListIds must be an array" });
    }

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });

    board.lists = orderedListIds;
    await board.save();

    for (let i = 0; i < orderedListIds.length; i++) {
      await List.findByIdAndUpdate(orderedListIds[i], { position: i });
    }

    const updated = await Board.findById(boardId)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .populate("lists");

    emitToBoard(boardId, "board:updated", { board: updated });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
