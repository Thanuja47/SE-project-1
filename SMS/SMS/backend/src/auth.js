// auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db"); // Database connection
require("dotenv").config();

const router = express.Router();

const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
app.use(bodyParser.json());

// JWT configuration
const secretKey = process.env.JWT_SECRET;
const refreshTokenSecret =
  process.env.REFRESH_TOKEN_SECRET || crypto.randomBytes(64).toString("hex");

// A mock database to store tokens (replace with your database implementation)
const tokensDB = {
  refreshTokens: [],
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization").split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Endpoint to handle refresh token
app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  // Check if refresh token is valid and exists in the database
  if (!tokensDB.refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  try {
    // Verify the refresh token
    const userData = jwt.verify(refreshToken, refreshTokenSecret);

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: userData.id, email: userData.email },
      secretKey,
      { expiresIn: "1h" }
    );

    // Send the new access token
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Failed to refresh token" });
  }
});

// User Registration
router.post("/register", async (req, res) => {
  const { name, email, password, role, department } = req.body;

  try {
    // Check if user already exists
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    // If the role is instructor, add a record to the instructors table
    if (role === "instructor") {
      await pool.query(
        "INSERT INTO instructors (user_id, department) VALUES (?, ?)",
        [result.insertId, department]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, role: role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // Compare hashed passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user info
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Export the router
module.exports = router;
