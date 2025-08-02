const express = require("express");
const { authenticate, roleMiddleware } = require("./middleware");
const pool = require("./db");

const router = express.Router();

// Get all users
router.get("/", authenticate, roleMiddleware("admin"), async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, name, email, role FROM users");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new user
router.post("/", authenticate, roleMiddleware("admin"), async (req, res) => {
  const { name, email, password, role } = req.body;

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

    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, role: role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
