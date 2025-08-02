const express = require("express");
const pool = require("./db");
const { authenticate, roleMiddleware } = require("./middleware");

const router = express.Router();

// Assign Grade to Student
router.post(
  "/",
  authenticate,
  roleMiddleware("admin", "instructor"),
  async (req, res) => {
    const { student_id, course_id, grade } = req.body;

    try {
      await pool.query(
        "INSERT INTO grades (student_id, course_id, grade) VALUES (?, ?, ?)",
        [student_id, course_id, grade]
      );

      res.status(201).json({ message: "Grade assigned successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error assigning grade", error });
    }
  }
);

// Get Grades of a Student
router.get("/student/:student_id", authenticate, async (req, res) => {
  const { student_id } = req.params;

  try {
    const [grades] = await pool.query(
      "SELECT * FROM grades WHERE student_id = ?",
      [student_id]
    );

    res.json(grades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching grades", error });
  }
});

module.exports = router;
