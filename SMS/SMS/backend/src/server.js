const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./cronJobs");

const authRoutes = require("./auth");
const userRoutes = require("./users");
const courseRoutes = require("./courses");
const studentRoutes = require("./students");
const schoolRoutes = require("./schools");
const enrollmentRoutes = require("./enrollments");
const attendanceRoutes = require("./attendance");
const classRoutes = require("./classes");
const instructorRoutes = require("./instructors");
const gradeRoutes = require("./grades");
const paymentRoutes = require("./payments");
const adminRoutes = require("./admin");
const reports = require("./reports");
const feeStructuresRouter = require("./feeStructures");

const app = express();
//app.use(cors());
//app.use(express.json());

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows JSON request body

// Sample Route
app.get("/", (req, res) => {
  res.send("School Management System API is running...");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Database
const db = require("./db");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reports);
app.use("/api/fee_structures", feeStructuresRouter);
