const express = require("express");
const pool = require("./db");
const { authenticate, roleMiddleware } = require("./middleware");
const sendEmail = require("../config/email");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const router = express.Router();

// Generate a temporary password
const generateTemporaryPassword = () => {
  return crypto.randomBytes(8).toString("hex");
};

// Add a new instructor
router.post("/", authenticate, roleMiddleware("admin"), async (req, res) => {
  const { name, email, department } = req.body;
  const tempPassword = generateTemporaryPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  try {
    // Insert user record
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role, is_temporypassword) VALUES (?, ?, ?, 'instructor', TRUE)",
      [name, email, hashedPassword]
    );

    const userId = result.insertId;

    // Insert instructor record
    await pool.query(
      "INSERT INTO instructors (user_id, name, department) VALUES (?, ?, ?)",
      [userId, name, department]
    );

    // Send email with temporary password
    const subject = "Welcome to the School Management System";
    const text = `Dear ${name},\n\nYou have been added as an instructor in the School Management System.\n\nYour temporary password is: ${tempPassword}\n\nPlease log in and change your password immediately.\n\nBest Regards,\nSchool Management System`;

    sendEmail(email, subject, text);

    res.json({ message: "Instructor added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding instructor", error });
  }
});

// Get All Instructors
router.get("/", authenticate, async (req, res) => {
  try {
    const [instructors] = await pool.query(
      "SELECT * FROM instructors WHERE is_deleted = FALSE"
    );

    res.json(instructors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching instructors", error });
  }
});

module.exports = router;
