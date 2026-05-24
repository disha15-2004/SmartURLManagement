const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔑 Register
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ details: "Please enter all fields" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ details: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ details: err.message });
  }
};

// 🔐 Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ details: "Please enter all fields" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ details: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ details: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username
      },
    };

    // Use a hardcoded secret for now to avoid .env issues on user side, but normally this goes in .env
    const jwtSecret = "supersecretkey123";

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: "5d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: payload.user });
      }
    );
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ details: err.message });
  }
};
