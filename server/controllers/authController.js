const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password, role: role || "Student" });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("register error:", err.message, err.stack);
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: "Registration failed" });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("login error:", err.message, err.stack);
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: "Login failed" });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("getMe error:", err.message);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};