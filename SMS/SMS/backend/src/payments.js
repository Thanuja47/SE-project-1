const express = require("express");
const pool = require("./db");
const { authenticate, roleMiddleware } = require("./middleware");
const sendEmail = require("../config/email");

const router = express.Router();

// Make a Payment
router.post("/pay", authenticate, roleMiddleware("admin"), async (req, res) => {
  const { student_id, course_id, amount } = req.body;
  const transaction_id = "txn_" + Math.random().toString(36).substr(2, 9);

  try {
    // Validate student exists
    const [student] = await pool.query(
      "SELECT id, email, first_name FROM students WHERE id = ? AND is_deleted = FALSE",
      [student_id]
    );

    if (student.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get current remaining fee
    const [existingPayments] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE student_id = ? AND course_id = ? AND is_deleted = FALSE",
      [student_id, course_id]
    );

    const [course] = await pool.query(
      `SELECT fs.fee_amount 
      FROM courses c
      JOIN fee_structures fs ON c.id = fs.course_id
      WHERE c.id = ? 
        AND c.is_deleted = FALSE;
      `,
      [course_id]
    );

    const totalFee = course[0].fee;
    const totalPaid = existingPayments[0].total_paid;
    const remainingFee = totalFee - totalPaid;

    if (amount > remainingFee) {
      return res.status(400).json({ message: "Payment exceeds remaining fee" });
    }

    // Insert new payment record
    await pool.query(
      `INSERT INTO payments (student_id, course_id, amount, transaction_id, payment_date, status, is_deleted, remaining_fee) 
      VALUES (?, ?, ?, ?, NOW(), "completed", 0, ?)`,
      [student_id, course_id, amount, transaction_id, remainingFee - amount]
    );

    const studentEmail = student[0].email;
    const studentName = student[0].first_name;

    // Send Payment Notification Email
    const subject = "Payment Receipt - School Management System";
    const text = `Dear ${studentName},\n\nYour payment of LKR ${amount} has been successfully received.\nTransaction ID: ${transaction_id}\nRemaining Fee: LKR ${
      remainingFee - amount
    }\n\nThank you!\nBest Regards,\nSchool Management System`;

    sendEmail(studentEmail, subject, text);

    res.json({
      message: "Payment successful",
      transaction_id,
      remaining_fee: remainingFee - amount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing payment", error });
  }
});

// Get Payment History of a Student
router.get("/student/:student_id", authenticate, async (req, res) => {
  const { student_id } = req.params;

  try {
    const [payments] = await pool.query(
      "SELECT * FROM payments WHERE student_id = ?",
      [student_id]
    );

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching payments", error });
  }
});

// Get Pending Payments for a Student
router.get(
  "/pending",
  authenticate,
  roleMiddleware(["student", "instructor", "admin"]),
  async (req, res) => {
    const { student_id } = req.query;
    const user_id = req.user.id;

    try {
      // If the role is student, use the logged-in user's student ID
      let studentIdToQuery;
      if (req.user.role === "student") {
        const [student] = await pool.query(
          "SELECT id FROM students WHERE  is_deleted = FALSE",
          [user_id]
        );

        if (student.length === 0) {
          return res.status(404).json({ message: "Student not found" });
        }

        studentIdToQuery = student[0].id;
      } else {
        // For admin and instructor, use the provided student_id
        studentIdToQuery = student_id;
      }

      // Fetch pending payments for the student
      const [pendingPayments] = await pool.query(
        "SELECT payments.*, courses.name as courseName FROM payments JOIN courses ON payments.course_id = courses.id WHERE payments.status = 'pending'",
        [studentIdToQuery]
      );

      if (pendingPayments.length === 0) {
        return res.status(404).json({ message: "No pending payments found" });
      }

      res.json(pendingPayments);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error fetching pending payments", error });
    }
  }
);

// Get Payment History for Admin
router.get(
  "/admin/payments",
  authenticate,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const [payments] = await pool.query(`
      SELECT 
        p.id, 
        u.name AS student_name, 
        c.name AS course_name, 
        p.amount, 
        p.payment_date, 
        p.status, 
        p.transaction_id 
      FROM payments p
      JOIN students s ON p.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN courses c ON p.course_id = c.id
      ORDER BY p.payment_date DESC;
    `);

      res.json(payments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching payments", error });
    }
  }
);

// Get Revenue Data for Admin
router.get(
  "/admin/payments/revenue",
  authenticate,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const [revenue] = await pool.query(`
      SELECT 
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS total_revenue,
        COUNT(CASE WHEN status = 'completed' THEN 1 ELSE NULL END) AS total_transactions,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending_payments
      FROM payments;
    `);

      res.json(revenue[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching revenue data", error });
    }
  }
);

// Filter Payments for Admin
router.get(
  "/admin/payments/filter",
  authenticate,
  roleMiddleware("admin"),
  async (req, res) => {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res
        .status(400)
        .json({ message: "Start and end dates are required" });
    }

    try {
      const [payments] = await pool.query(
        `
      SELECT 
        p.id, 
        u.name AS student_name, 
        c.name AS course_name, 
        p.amount, 
        p.payment_date, 
        p.status, 
        p.transaction_id 
      FROM payments p
      JOIN students s ON p.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN courses c ON p.course_id = c.id
      WHERE DATE(p.payment_date) BETWEEN ? AND ?
      ORDER BY p.payment_date DESC;
    `,
        [start_date, end_date]
      );

      res.json(payments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error filtering payments", error });
    }
  }
);

// Fetch all fee structures
router.get("/", authenticate, roleMiddleware("admin"), async (req, res) => {
  try {
    const [feeStructures] = await pool.query(
      "SELECT * FROM fee_structures WHERE is_deleted = FALSE"
    );
    res.json(feeStructures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching fee structures", error });
  }
});

// Add a new fee structure
router.post("/", authenticate, roleMiddleware("admin"), async (req, res) => {
  const { course_id, fee_amount } = req.body;

  try {
    await pool.query(
      "INSERT INTO fee_structures (course_id, fee_amount) VALUES (?, ?)",
      [course_id, fee_amount]
    );
    res.json({ message: "Fee structure added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding fee structure", error });
  }
});

// Update an existing fee structure
router.put("/:id", authenticate, roleMiddleware("admin"), async (req, res) => {
  const { id } = req.params;
  const { course_id, fee_amount } = req.body;

  try {
    await pool.query(
      "UPDATE fee_structures SET course_id = ?, fee_amount = ? WHERE id = ? AND is_deleted = FALSE",
      [course_id, fee_amount, id]
    );
    res.json({ message: "Fee structure updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating fee structure", error });
  }
});

// Delete a fee structure
router.delete(
  "/:id",
  authenticate,
  roleMiddleware("admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      await pool.query(
        "UPDATE fee_structures SET is_deleted = TRUE WHERE id = ?",
        [id]
      );
      res.json({ message: "Fee structure deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting fee structure", error });
    }
  }
);

// Get Payment History
router.get(
  "/history",
  authenticate,
  roleMiddleware(["student", "admin"]),
  async (req, res) => {
    try {
      const userId = req.user.id;

      if (req.user.role === "student") {
        // Get the student's ID from the logged-in user
        const [student] = await pool.query(
          "SELECT id FROM students WHERE user_id = ? AND is_deleted = FALSE",
          [userId]
        );

        if (student.length === 0) {
          return res.status(404).json({ message: "Student not found" });
        }

        const studentId = student[0].id;

        // Fetch payment history for the specific student
        const [paymentHistory] = await pool.query(
          `SELECT 
              p.id, 
              c.name AS courseName, 
              p.amount, 
              p.payment_date, 
              p.status, 
              p.transaction_id 
           FROM 
              payments p 
           JOIN 
              courses c ON p.course_id = c.id 
           WHERE 
              p.student_id = ? 
              AND p.is_deleted = FALSE`,
          [studentId]
        );

        if (paymentHistory.length === 0) {
          return res.status(404).json({ message: "No payment history found" });
        }

        return res.json(paymentHistory);
      }

      if (req.user.role === "admin") {
        // Fetch all payment history for admins
        const [paymentHistory] = await pool.query(
          `SELECT 
              p.id, 
              s.first_name AS studentName, 
              c.name AS courseName, 
              p.amount, 
              p.payment_date, 
              p.status, 
              p.transaction_id 
           FROM 
              payments p 
           JOIN 
              students s ON p.student_id = s.id 
           JOIN 
              courses c ON p.course_id = c.id 
           WHERE 
              p.is_deleted = FALSE
           ORDER BY p.payment_date DESC`
        );

        if (paymentHistory.length === 0) {
          return res.status(404).json({ message: "No payment history found" });
        }

        return res.json(paymentHistory);
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error fetching payment history", error });
    }
  }
);

module.exports = router;
