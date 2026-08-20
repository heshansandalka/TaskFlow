import Task from "../models/Task.js";
import List from "../models/List.js";
import { emitToBoard, emitToUser } from "../socket/index.js";

// @desc    Create a task in a list
// @route   POST /api/lists/:listId/tasks
export const createTask = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title, description, priority, dueDate } = req.body;

    if (!title) return res.status(400).json({ message: "Task title is required" });

    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: "List not found" });

    const existingTasks = await Task.find({ list: listId });

    const task = await Task.create({
      title,
      description: description || "",
      list: listId,
      board: list.board,
      priority: priority || "medium",
      dueDate: dueDate || null,
      position: existingTasks.length,
    });

    const populated = await Task.findById(task._id)
      .populate("assignees", "name email avatar")
      .populate("comments.user", "name email avatar");

    emitToBoard(list.board.toString(), "task:created", {
      listId: listId.toString(),
      task: populated,
    });

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PATCH /api/tasks/:taskId
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    Object.assign(task, updates);
    await task.save();

    const populated = await Task.findById(taskId)
      .populate("assignees", "name email avatar")
      .populate("comments.user", "name email avatar");

    emitToBoard(task.board.toString(), "task:updated", { task: populated });

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:taskId
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { board, list } = task;
    await Task.findByIdAndDelete(taskId);

    emitToBoard(board.toString(), "task:deleted", { taskId, listId: list.toString() });

    return res.json({ message: "Task deleted", taskId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Move a task between lists or reorder within a list
// @route   PATCH /api/tasks/:taskId/move
export const moveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { toListId, toIndex } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const fromListId = task.list.toString();
    const targetListId = toListId || fromListId;

    task.list = targetListId;
    task.position = toIndex !== undefined ? toIndex : task.position;
    await task.save();

    const populated = await Task.findById(taskId)
      .populate("assignees", "name email avatar")
      .populate("comments.user", "name email avatar");

    emitToBoard(task.board.toString(), "task:moved", {
      task: populated,
      fromListId,
      toListId: targetListId,
      toIndex: task.position,
    });

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Assign user to task
// @route   PATCH /api/tasks/:taskId/assign
export const assignUser = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!task.assignees.includes(userId)) {
      task.assignees.push(userId);
      await task.save();

      emitToUser(userId, "notification:assigned", {
        message: `${req.user.name} assigned you to task "${task.title}"`,
      });
    }

    const populated = await Task.findById(taskId)
      .populate("assignees", "name email avatar")
      .populate("comments.user", "name email avatar");

    emitToBoard(task.board.toString(), "task:updated", { task: populated });

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:taskId/comments
export const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.comments.push({
      user: req.user._id,
      text,
    });

    await task.save();

    const populated = await Task.findById(taskId)
      .populate("assignees", "name email avatar")
      .populate("comments.user", "name email avatar");

    emitToBoard(task.board.toString(), "task:updated", { task: populated });

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle checklist item completion
// @route   PATCH /api/tasks/:taskId/checklist/:itemId
export const toggleChecklistItem = async (req, res) => {
  try {
    const { taskId, itemId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const item = task.checklist.id(itemId);
    if (!item) return res.status(404).json({ message: "Checklist item not found" });

    item.completed = !item.completed;
    await task.save();

    const populated = await Task.findById(taskId)
      .populate("assignees", "name email avatar")
      .populate("comments.user", "name email avatar");

    emitToBoard(task.board.toString(), "task:updated", { task: populated });

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
