const express = require("express");
const pool = require("./db");
const { authenticate, roleMiddleware } = require("./middleware");

const router = express.Router();

// Create a Course
router.post("/", authenticate, roleMiddleware("admin"), async (req, res) => {
  const {
    name,
    description,
    school_id,
    course_type,
    duration,
    delivery_mode,
    fee_amount,
  } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [courseResult] = await connection.query(
      "INSERT INTO courses (name, description, school_id, course_type, duration, delivery_mode) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, school_id, course_type, duration, delivery_mode]
    );

    const courseId = courseResult.insertId;

    await connection.query(
      "INSERT INTO fee_structures (course_id, fee_amount) VALUES (?, ?)",
      [courseId, fee_amount]
    );

    await connection.commit();

    res.status(201).json({
      message: "Course and fee structure created successfully",
      course_id: courseId,
    });
  } catch (error) {
    await connection.rollback();
    res
      .status(500)
      .json({ message: "Error creating course and fee structure", error });
  } finally {
    connection.release();
  }
});

// Get All Courses
router.get("/", async (req, res) => {
  try {
    const [courses] = await pool.query(
      `SELECT courses.*, schools.name AS school_name, fee_structures.fee_amount 
       FROM courses 
       JOIN schools ON courses.school_id = schools.id 
       JOIN fee_structures ON courses.id = fee_structures.course_id 
       WHERE courses.is_deleted = FALSE`
    );
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error });
  }
});

// Search & Filter Courses
router.get("/search", async (req, res) => {
  const { name, course_type, delivery_mode } = req.query;
  let query = "SELECT * FROM courses WHERE is_deleted = FALSE";
  let params = [];

  if (name) {
    query += " AND name LIKE ?";
    params.push(`%${name}%`);
  }
  if (course_type) {
    query += " AND course_type = ?";
    params.push(course_type);
  }
  if (delivery_mode) {
    query += " AND delivery_mode = ?";
    params.push(delivery_mode);
  }

  try {
    const [courses] = await pool.query(query, params);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error searching courses", error });
  }
});

// Get Course by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [course] = await pool.query(
      `SELECT c.*, f.fee_amount 
       FROM courses c 
       LEFT JOIN fee_structures f ON c.id = f.course_id 
       WHERE c.id = ? AND c.is_deleted = FALSE`,
      [id]
    );
    if (course.length === 0)
      return res.status(404).json({ message: "Course not found with this id" });
    res.json(course[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching course", error });
  }
});

// Update a Course
router.put("/:id", authenticate, roleMiddleware("admin"), async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    school_id,
    course_type,
    duration,
    delivery_mode,
    fee_amount,
  } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE courses 
       SET name = ?, description = ?, school_id = ?, course_type = ?, duration = ?, delivery_mode = ? 
       WHERE id = ? AND is_deleted = FALSE`,
      [name, description, school_id, course_type, duration, delivery_mode, id]
    );

    await connection.query(
      "UPDATE fee_structures SET fee_amount = ? WHERE course_id = ?",
      [fee_amount, id]
    );

    await connection.commit();
    res.json({ message: "Course updated successfully" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Error updating course", error });
  } finally {
    connection.release();
  }
});

// Delete a Course
router.delete(
  "/:id",
  authenticate,
  roleMiddleware("admin"),
  async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query("UPDATE courses SET is_deleted = TRUE WHERE id = ?", [
        id,
      ]);
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting course", error });
    }
  }
);

module.exports = router;
