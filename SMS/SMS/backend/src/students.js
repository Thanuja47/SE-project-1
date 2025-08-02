const express = require("express");
const pool = require("./db");
const { authenticate, roleMiddleware } = require("./middleware");

const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Student Registration
router.post("/register", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    address,
    dob,
    school_id,
  } = req.body;

  try {
    // Check if email already exists
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into users table
    const [userResult] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [`${first_name} ${last_name}`, email, hashedPassword, "student"]
    );

    const user_id = userResult.insertId;

    // Insert into students table
    await pool.query(
      "INSERT INTO students (user_id, first_name, last_name, email, phone, address, dob, school_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [user_id, first_name, last_name, email, phone, address, dob, school_id]
    );

    res
      .status(201)
      .json({ message: "Student registered successfully", user_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering student", error });
  }
});

// Student Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user[0].id, role: user[0].role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Get Student Profile
router.get("/profile", authenticate, async (req, res) => {
  const user_id = req.user.id;

  try {
    // Fetch student profile details
    const [studentProfile] = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, s.email, s.phone, s.address, s.dob, s.financial_status, sch.name AS school_name
       FROM students s
       JOIN schools sch ON s.school_id = sch.id
       WHERE s.user_id = ? AND s.is_deleted = FALSE AND sch.is_deleted = FALSE`,
      [user_id]
    );

    if (studentProfile.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Fetch enrolled courses from enrollments table
    const [courses] = await pool.query(
      `SELECT c.id, 
       c.name AS course_name, 
       c.course_type, 
       c.duration, 
       fs.fee_amount, 
       c.delivery_mode
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN fee_structures fs ON c.id = fs.course_id
      WHERE e.student_id = ?  AND e.is_deleted = FALSE;`,
      [studentProfile[0].id]
    );

    res.json({ ...studentProfile[0], enrolled_courses: courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching student profile", error });
  }
});

// Update Student Profile
router.put(
  "/profile",
  authenticate,
  roleMiddleware("student"),
  async (req, res) => {
    const { email, phone, address } = req.body;

    try {
      // Update users table
      await pool.query("UPDATE users SET email = ? WHERE id = ?", [
        email,
        req.user.id,
      ]);

      // Update students table
      await pool.query(
        "UPDATE students SET phone = ?, email = ?, address = ? WHERE user_id = ?",
        [phone, email, address, req.user.id]
      );

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating profile", error });
    }
  }
);

// Delete Student
router.delete(
  "/profile/:student_id",
  authenticate,
  roleMiddleware(["student", "admin"]),
  async (req, res) => {
    const student_id = req.params.student_id;
    try {
      // Fetch the user_id from the students table
      const [student] = await pool.query(
        "SELECT user_id FROM students WHERE id = ?",
        [student_id]
      );

      if (student.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      const user_id = student[0].user_id;

      // Mark the student as deleted in the students table
      await pool.query("UPDATE students SET is_deleted = TRUE WHERE id = ?", [
        student_id,
      ]);

      // Mark the user as deleted in the users table
      await pool.query("UPDATE users SET is_deleted = TRUE WHERE id = ?", [
        user_id,
      ]);

      res.json({ message: "Student account deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting student", error });
    }
  }
);

// Get Student's Enrolled Courses
router.get(
  "/course",
  authenticate,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const [courses] = await pool.query(
        `SELECT 
          c.id, 
          c.name AS course_name, 
          c.course_type, 
          c.duration, 
          fs.fee_amount, 
          c.delivery_mode,
          s.name AS school_name 
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN fee_structures fs ON c.id = fs.course_id
       JOIN schools s ON c.school_id = s.id
       WHERE e.student_id = (SELECT id FROM students WHERE user_id = ?) 
         AND e.is_deleted = FALSE;
`,
        [req.user.id]
      );

      if (courses.length === 0) {
        return res.status(404).json({ message: "No enrolled courses found" });
      }

      res.json(courses);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error fetching enrolled courses", error });
    }
  }
);

// Get All Students (Not Deleted)
router.get(
  "/students",
  authenticate,
  roleMiddleware(["admin", "instructor"]),
  async (req, res) => {
    try {
      const [students] = await pool.query(
        `SELECT s.id, s.first_name, s.last_name, s.email, s.phone, s.address, s.dob, sch.name AS school_name
       FROM students s
       JOIN schools sch ON s.school_id = sch.id
       WHERE s.is_deleted = FALSE AND sch.is_deleted = FALSE`
      );

      res.json(students);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching students", error });
    }
  }
);

// Get Student by ID
router.get("/students/:student_id", authenticate, async (req, res) => {
  const student_id = req.params.student_id;

  try {
    const [student] = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, s.email, s.phone, s.address, s.dob, sch.id AS school_id
       FROM students s
       JOIN schools sch ON s.school_id = sch.id
       WHERE s.id = ? AND s.is_deleted = FALSE AND sch.is_deleted = FALSE`,
      [student_id]
    );

    if (student.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching student", error });
  }
});

// Get Student's Courses
router.get("/students/:student_id/courses", async (req, res) => {
  const { student_id } = req.params;
  try {
    const [courses] = await pool.query(
      `SELECT c.id, 
       c.name 
      FROM courses c
      JOIN classes cl ON c.id = cl.course_id
      JOIN enrollments e ON cl.id = e.class_id
      WHERE e.student_id = ? 
        AND c.is_deleted = FALSE;`,
      [student_id]
    );
    res.json(courses);
  } catch (error) {
    console.error("Failed to fetch courses for the student:", error);
    res
      .status(500)
      .json({ message: "Error fetching courses for the student", error });
  }
});

// Fech Courses for a Student
router.get("/:student_id/courses", async (req, res) => {
  const { student_id } = req.params;
  try {
    const [courses] = await pool.query(
      `SELECT c.id, c.name 
            FROM courses c 
            JOIN enrollments e ON c.id = e.class_id 
            WHERE e.student_id = ? 
            AND c.is_deleted = FALSE`,
      [student_id]
    );
    res.json(courses);
  } catch (error) {
    console.error("Failed to fetch courses for the student:", error);
    res
      .status(500)
      .json({ message: "Error fetching courses for the student", error });
  }
});

module.exports = router;
