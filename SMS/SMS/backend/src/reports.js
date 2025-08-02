const express = require("express");
const pool = require("./db");
const { authenticate, roleMiddleware } = require("./middleware");

const router = express.Router();

// Get Report Data
router.get("/:report", authenticate, async (req, res) => {
  const { report } = req.params;
  const decodedReport = decodeURIComponent(report);

  try {
    let query = "";
    switch (decodedReport) {
      case "School_Overview_Report":
        query = "SELECT * FROM schools WHERE is_deleted = 0";
        break;
      case "Course Details Report":
        query = "SELECT * FROM courses WHERE is_deleted = 0";
        break;
      case "Course_Enrollment_Report":
        query = `
          SELECT c.name AS course_name, COUNT(e.id) AS enrollment_count
          FROM courses c
          LEFT JOIN enrollments e ON c.id = e.course_id
          WHERE c.is_deleted = 0 AND e.is_deleted = 0
          GROUP BY c.id
        `;
        break;
      case "Student_Registration_Report":
        query = "SELECT * FROM students WHERE is_deleted = 0";
        break;
      case "Student_Profile_Report":
        query = `
          SELECT s.*, c.name AS course_name, e.status AS enrollment_status
          FROM students s
          LEFT JOIN enrollments e ON s.id = e.student_id
          LEFT JOIN courses c ON e.course_id = c.id
          WHERE s.is_deleted = 0 AND e.is_deleted = 0
        `;
        break;
      case "Class_Schedule_Report":
        query = "SELECT * FROM classes WHERE is_deleted = 0";
        break;
      case "Attendance_Report":
        query = `
          SELECT a.*, c.name AS class_name, s.first_name, s.last_name
          FROM attendance a
          LEFT JOIN classes c ON a.class_id = c.id
          LEFT JOIN students s ON a.student_id = s.id
          WHERE a.is_deleted = 0
        `;
        break;
      case "Fee_Structure_Report":
        query = "SELECT * FROM fee_structures WHERE is_deleted = 0";
        break;
      case "Payment_History_Report":
        query = "SELECT * FROM payments WHERE is_deleted = 0";
        break;
      case "Pending_Payments_Report":
        query =
          'SELECT * FROM payments WHERE status = "pending" AND is_deleted = 0';
        break;
      case "Grades_Report":
        query = "SELECT * FROM grades";
        break;
      case "Performance_Report":
        query = `
          SELECT s.first_name, s.last_name, c.name AS course_name, g.grade
          FROM grades g
          LEFT JOIN students s ON g.student_id = s.id
          LEFT JOIN courses c ON g.course_id = c.id
        `;
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    const [reportData] = await pool.query(query);
    res.json(reportData);
  } catch (error) {
    console.error("Error fetching report data:", error);
    res.status(500).json({ message: "Error fetching report data", error });
  }
});

module.exports = router;
