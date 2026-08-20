import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Board from "../models/Board.js";
import List from "../models/List.js";
import { JWT_SECRET } from "../middleware/auth.js";

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create a default board for the new user so they start with a working workspace
    const board = await Board.create({
      title: "My First Board",
      description: "Welcome to TaskFlow! Organize your tasks seamlessly.",
      color: "bg-brand-500",
      owner: user._id,
      members: [{ user: user._id, role: "admin" }],
    });

    const defaultLists = ["To Do", "In Progress", "Done"];
    const createdLists = [];

    for (let i = 0; i < defaultLists.length; i++) {
      const list = await List.create({
        title: defaultLists[i],
        board: board._id,
        position: i,
      });
      createdLists.push(list._id);
    }

    board.lists = createdLists;
    await board.save();

    const token = generateToken(user._id);
    return res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    return res.json({
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    return res.json({ user: req.user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update current user profile
// @route   PATCH /api/auth/me
export const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
