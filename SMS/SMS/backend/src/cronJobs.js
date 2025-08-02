const cron = require("node-cron");
const pool = require("./db");
const sendEmail = require("../config/email");

// Run every day at 6 PM
cron.schedule("0 18 * * *", async () => {
  console.log("📅 Running Daily Attendance Summary Email...");

  try {
    // Get today's absences
    const [absences] = await pool.query(
      `SELECT s.email, s.first_name, c.id AS class_id, co.name AS course_name
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       JOIN classes c ON a.class_id = c.id
       JOIN courses co ON c.course_id = co.id
       WHERE a.status = 'absent' AND DATE(a.recorded_at) = CURDATE()`
    );

    if (absences.length === 0) {
      console.log("✅ No absences today.");
      return;
    }

    // Send summary email
    const emails = absences.map((s) => s.email).join(", ");
    const subject = "Daily Attendance Summary - Absent Students";
    const text = `Today's absent students:\n\n${absences
      .map((s) => `${s.first_name} (${s.course_name})`)
      .join("\n")}`;

    sendEmail(emails, subject, text);
    console.log("✅ Daily Attendance Summary Sent.");
  } catch (error) {
    console.error("Error sending daily summary email:", error);
  }
});

module.exports = cron;
