const express = require("express");
const router = express.Router();
const pool = require("./db");
const { authenticate } = require("./middleware");
const bcrypt = require("bcryptjs");

// Route to get profile data
router.get("/profile", authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    // Fetch user data
    const [userResult] = await pool.query(
      "SELECT * FROM users WHERE id = ? AND is_deleted = FALSE",
      [userId]
    );
    const user = userResult[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user.role);
    // Fetch additional data based on role
    if (user.role === "student") {
      const [studentResult] = await pool.query(
        "SELECT * FROM students WHERE user_id = ? AND is_deleted = FALSE",
        [userId]
      );
      const student = studentResult[0];
      return res.json({ ...user, ...student });
    }

    if (user.role === "instructor") {
      const [instructorResult] = await pool.query(
        "SELECT * FROM instructors WHERE user_id = ? AND is_deleted = FALSE",
        [userId]
      );
      const instructor = instructorResult[0];
      return res.json({ ...user, ...instructor });
    }

    return res.json(user);
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    res.status(500).json({ message: "Error fetching user profile", error });
  }
});

// Route to change password
router.put("/profile/change-password", authenticate, async (req, res) => {
  const userId = req.user.id;
  const { old_password, new_password } = req.body;

  try {
    // Fetch user data
    const [userResult] = await pool.query(
      "SELECT * FROM users WHERE id = ? AND is_deleted = FALSE",
      [userId]
    );
    const user = userResult[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password in the database
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Failed to change password:", error);
    res.status(500).json({ message: "Error changing password", error });
  }
});

module.exports = router;
