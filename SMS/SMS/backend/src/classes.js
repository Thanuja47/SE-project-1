const express = require("express");
const pool = require("./db");
const { authenticate, roleMiddleware } = require("./middleware");
const sendEmail = require("../config/email");

const router = express.Router();

// Create a Class
router.post("/", authenticate, roleMiddleware("admin"), async (req, res) => {
  const {
    course_id,
    instructor_id,
    name,
    code,
    schedule,
    location,
    meeting_link,
  } = req.body;

  try {
    await pool.query(
      "INSERT INTO classes (course_id, instructor_id, name, code, schedule, location, meeting_link) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [course_id, instructor_id, name, code, schedule, location, meeting_link]
    );

    res.status(201).json({ message: "Class created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating class", error });
  }
});

// Update a Class
router.put("/:id", authenticate, roleMiddleware("admin"), async (req, res) => {
  const { id } = req.params;
  const { name, code, schedule, location, meeting_link } = req.body;

  try {
    await pool.query(
      "UPDATE classes SET name = ?, code = ?, schedule = ?, location = ?, meeting_link = ? WHERE id = ?",
      [name, code, schedule, location, meeting_link, id]
    );

    res.json({ message: "Class updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating class", error });
  }
});

// Delete a Class
router.delete(
  "/:id",
  authenticate,
  roleMiddleware("admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      await pool.query("UPDATE classes SET is_deleted = TRUE WHERE id = ?", [
        id,
      ]);
      res.json({ message: "Class deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting class", error });
    }
  }
);

// Get All Classes
router.get("/", authenticate, async (req, res) => {
  try {
    const [classes] = await pool.query(
      `SELECT cls.id, cls.name, cls.code, cls.schedule, cls.location, cls.meeting_link, cls.instructor_id, cls.is_deleted, crs.name AS course_name
       FROM classes cls
       JOIN courses crs ON cls.course_id = crs.id
       WHERE cls.is_deleted = FALSE`
    );

    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching classes", error });
  }
});

// Get Class by ID
router.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const [classData] = await pool.query(
      "SELECT * FROM classes WHERE id = ? AND is_deleted = FALSE",
      [id]
    );

    if (classData.length === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(classData[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching class", error });
  }
});

// Get students in a class
router.get("/class/:class_id", authenticate, async (req, res) => {
  const { class_id } = req.params;

  try {
    const [students] = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, s.email, s.phone, s.address, s.dob, sch.name AS school_name, crs.name AS course_name
       FROM students s
       JOIN enrollments en ON s.id = en.student_id
       JOIN classes cls ON en.class_id = cls.id
       JOIN courses crs ON cls.course_id = crs.id
       JOIN schools sch ON s.school_id = sch.id
       WHERE en.class_id = ? AND en.status = 'active' AND en.is_deleted = FALSE`,
      [class_id]
    );

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching students", error });
  }
});

// Route to record attendance for a class
router.post("/:class_id/attendance", authenticate, async (req, res) => {
  const { class_id } = req.params;
  const { attendance } = req.body;

  try {
    console.log(`Recording attendance for class_id: ${class_id}`);
    // Loop through the attendance object and insert/update records
    for (const [student_id, isPresent] of Object.entries(attendance)) {
      const status = isPresent ? "present" : "absent";
      await pool.query(
        `INSERT INTO attendance (class_id, student_id, status, recorded_at)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE status = VALUES(status), recorded_at = VALUES(recorded_at)`,
        [class_id, student_id, status]
      );

      // Fetch student details for email notification
      const [student] = await pool.query(
        "SELECT email, first_name FROM students WHERE id = ?",
        [student_id]
      );

      if (student.length > 0 && status === "absent") {
        const studentEmail = student[0].email;
        const studentName = student[0].first_name;

        // Send Absence Notification Email
        const subject = "Attendance Alert - You were marked absent";
        const text = `Hello ${studentName},\n\nYou were marked absent for your class today. Please ensure you attend future sessions.\n\nBest Regards,\nSchool Management System`;

        await sendEmail(studentEmail, subject, text);
      }
    }
    res.json({ message: "Attendance recorded successfully!" });
  } catch (error) {
    console.error("Error recording attendance:", error);
    res.status(500).json({ message: "Error recording attendance", error });
  }
});

// Get Class Schedule
router.get("/:course_id/schedule", async (req, res) => {
  try {
    const { course_id } = req.params;
    const [schedule] = await pool.query(
      "SELECT cl.id, cl.name, cl.schedule FROM classes cl WHERE cl.course_id = ? AND cl.is_deleted = FALSE",
      [course_id]
    );
    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching class schedule" });
  }
});

// Get Classes by Course ID
router.get("/:course_id/classes", async (req, res) => {
  try {
    const { course_id } = req.params;
    const [classes] = await pool.query(
      `SELECT cl.id, 
       cl.name, 
       ins.name as instructor, 
       fs.fee_amount as fees 
      FROM classes cl 
      JOIN instructors ins ON cl.instructor_id = ins.id 
      JOIN courses c ON cl.course_id = c.id 
      JOIN fee_structures fs ON c.id = fs.course_id 
      WHERE cl.course_id = ? 
        AND cl.is_deleted = FALSE;`,
      [course_id]
    );
    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching classes" });
  }
});

module.exports = router;
