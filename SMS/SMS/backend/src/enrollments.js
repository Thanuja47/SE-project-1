const express = require("express");
const pool = require("./db");
const { authenticate, roleMiddleware } = require("./middleware");

const router = express.Router();

// Enroll in a Class
router.post("/", authenticate, roleMiddleware("student"), async (req, res) => {
  const { class_id } = req.body;
  const user_id = req.user.id;

  try {
    // Fetch the student_id based on the user_id
    const [student] = await pool.query(
      "SELECT id FROM students WHERE user_id = ? AND is_deleted = FALSE",
      [user_id]
    );

    if (student.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student_id = student[0].id;

    // Check if the student is already enrolled in this class
    const [existingEnrollment] = await pool.query(
      "SELECT * FROM enrollments WHERE student_id = ? AND class_id = ? AND is_deleted = FALSE",
      [student_id, class_id]
    );

    if (existingEnrollment.length > 0) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this class" });
    }

    // Insert into enrollments table
    await pool.query(
      "INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)",
      [student_id, class_id]
    );

    // Fetch course fee and course_id
    const [course] = await pool.query(
      `SELECT id, 
       fs.fee_amount 
FROM courses c
JOIN fee_structures fs ON c.id = fs.course_id
WHERE c.id = (SELECT course_id FROM classes WHERE id = ?) 
  AND c.is_deleted = FALSE;`,
      [class_id]
    );

    if (course.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    const course_id = course[0].id;
    const course_fee = course[0].fee;

    // Insert into payments table
    await pool.query(
      "INSERT INTO payments (student_id, course_id, class_id, amount, status) VALUES (?, ?, ?, ?, 'pending')",
      [student_id, course_id, class_id, course_fee]
    );

    res.status(201).json({ message: "Enrolled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error enrolling in class", error });
  }
});

// Get Student's Enrolled Courses
router.get("/", authenticate, roleMiddleware("student"), async (req, res) => {
  const user_id = req.user.id;

  try {
    // Fetch the student_id based on the user_id
    const [student] = await pool.query(
      "SELECT id FROM students WHERE user_id = ? AND is_deleted = FALSE",
      [user_id]
    );

    if (student.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student_id = student[0].id;

    const [courses] = await pool.query(
      `SELECT e.id, 
       c.name AS course_name, 
       c.course_type, 
       c.duration, 
       fs.fee_amount, 
       c.delivery_mode, 
       e.status, 
       e.enrollment_date,
       cls.id AS class_id,
       cls.name AS class_name,
       cls.code AS class_code
        FROM enrollments e
        JOIN classes cls ON e.class_id = cls.id
        JOIN courses c ON cls.course_id = c.id
        JOIN fee_structures fs ON c.id = fs.course_id
        JOIN students s ON e.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE e.student_id = ? AND e.is_deleted = FALSE AND u.is_deleted = FALSE;`,
      [student_id]
    );

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching enrolled courses", error });
  }
});

// Drop a Course
router.put(
  "/:id/drop",
  authenticate,
  roleMiddleware("student"),
  async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
      // Fetch the student_id based on the user_id
      const [student] = await pool.query(
        "SELECT id FROM students WHERE user_id = ? AND is_deleted = FALSE",
        [user_id]
      );

      if (student.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      const student_id = student[0].id;

      // Check if the enrollment exists
      const [enrollment] = await pool.query(
        "SELECT * FROM enrollments WHERE id = ? AND student_id = ? AND is_deleted = FALSE",
        [id, student_id]
      );

      if (enrollment.length === 0) {
        return res.status(404).json({ message: "Enrollment not found" });
      }

      // Soft delete enrollment
      await pool.query(
        "UPDATE enrollments SET status = 'dropped', is_deleted = TRUE WHERE id = ?",
        [id]
      );

      res.json({ message: "Enrollment dropped successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error dropping enrollment", error });
    }
  }
);

module.exports = router;
