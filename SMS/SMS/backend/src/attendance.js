const express = require("express");
const pool = require("./db");
const generatePDF = require("../utils/generateReport");
const { authenticate, roleMiddleware } = require("./middleware");
const sendEmail = require("../config/email");

const router = express.Router();

// Mark Attendance
router.post(
  "/mark",
  authenticate,
  roleMiddleware(["instructor", "admin"]),
  async (req, res) => {
    const { class_id, student_id, status } = req.body;

    try {
      // Check if the class exists
      const [classExists] = await pool.query(
        "SELECT * FROM classes WHERE id = ?",
        [class_id]
      );
      if (classExists.length === 0) {
        return res.status(404).json({ message: "Class not found" });
      }

      // Check if the student is enrolled in the class
      const [enrolled] = await pool.query(
        `SELECT * FROM enrollments WHERE student_id = ? AND class_id = ?`,
        [student_id, class_id]
      );
      if (enrolled.length === 0) {
        return res
          .status(400)
          .json({ message: "Student is not enrolled in this class" });
      }

      // Mark Attendance
      await pool.query(
        "INSERT INTO attendance (class_id, student_id, status) VALUES (?, ?, ?)",
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

        sendEmail(studentEmail, subject, text);
      }

      res.json({ message: "Attendance recorded successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error marking attendance", error });
    }
  }
);

// Get Attendance for a Class
router.get("/class/:class_id", authenticate, async (req, res) => {
  const { class_id } = req.params;

  try {
    const [attendanceRecords] = await pool.query(
      `SELECT a.id, s.first_name, s.last_name, a.status, a.recorded_at
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       WHERE a.class_id = ?`,
      [class_id]
    );

    res.json(attendanceRecords);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching attendance records", error });
  }
});

// Get Attendance for a Student
router.get(
  "/student/:student_id",
  authenticate,
  roleMiddleware("student"),
  async (req, res) => {
    const { student_id } = req.params;

    // Ensure students can only view their own attendance
    if (req.user.role === "student" && req.user.id !== parseInt(student_id)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    try {
      const [attendanceRecords] = await pool.query(
        `SELECT a.id, c.name AS course_name, cls.schedule, a.status, a.recorded_at
       FROM attendance a
       JOIN classes cls ON a.class_id = cls.id
       JOIN courses c ON cls.course_id = c.id
       WHERE a.student_id = ?`,
        [student_id]
      );

      res.json(attendanceRecords);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error fetching attendance records", error });
    }
  }
);

// Get all Attendance Records
router.get("/", authenticate, roleMiddleware("admin"), async (req, res) => {
  try {
    const [attendance] = await pool.query(
      `SELECT a.id, a.status, a.recorded_at, 
                c.id AS class_id, c.schedule, c.location, 
                co.name AS course_name, i.user_id AS instructor_id, u.name AS instructor_name, 
                s.first_name, s.last_name, s.email
         FROM attendance a
         JOIN classes c ON a.class_id = c.id
         JOIN courses co ON c.course_id = co.id
         JOIN instructors i ON c.instructor_id = i.id
         JOIN users u ON i.user_id = u.id
         JOIN students s ON a.student_id = s.id
         WHERE a.is_deleted = FALSE`
    );

    if (attendance.length === 0) {
      return res.status(404).json({ message: "No attendance records found." });
    }

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching attendance records", error });
  }
});

// Generate Attendance Report
router.get(
  "/report/:class_id",
  authenticate,
  roleMiddleware(["admin", "instructor"]),
  async (req, res) => {
    const class_id = req.params.class_id;

    try {
      // Fetch attendance data
      const [attendanceData] = await pool.query(
        `SELECT s.first_name AS student_name, cl.schedule AS class_schedule, a.status, a.recorded_at, co.name AS course_name 
          FROM attendance a
          JOIN students s ON a.student_id = s.id
          JOIN classes cl ON a.class_id = cl.id
          JOIN courses co ON cl.course_id = co.id
          WHERE a.class_id = ?`,
        [class_id]
      );

      if (attendanceData.length === 0) {
        return res.status(404).json({ message: "No attendance records found" });
      }

      // Extract course name
      const courseName = attendanceData[0].course_name;

      // Generate PDF report
      const pdfPath = await generatePDF(
        `attendance_report_${courseName}_${class_id}.pdf`,
        `Attendance Report for ${courseName}`,
        attendanceData
      );

      res.download(pdfPath); // Send PDF file to the client
    } catch (error) {
      console.error("Error generating attendance report:", error);
      res.status(500).json({
        message: "Error generating attendance report",
        error: error.message,
      });
    }
  }
);

module.exports = router;
