const express = require("express");
const pool = require("./db");
const { authenticate, roleMiddleware } = require("./middleware");

const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Add a School
router.post(
  "/schools",
  authenticate,
  roleMiddleware("admin"),
  async (req, res) => {
    const { name, description } = req.body;

    try {
      await pool.query("INSERT INTO schools (name,description) VALUES (?,?)", [
        name,
        description,
      ]);
      res.status(201).json({ message: "School added successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error adding school", error });
    }
  }
);

// Update School
router.put(
  "/schools/:id",
  authenticate,
  roleMiddleware("admin"),
  async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
      await pool.query(
        "UPDATE schools SET name = ? , description= ?  WHERE id = ?",
        [name, description, id]
      );
      res.json({ message: "School updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating school", error });
    }
  }
);
// Delete School
router.delete(
  "/schools/:id",
  authenticate,
  roleMiddleware("admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      await pool.query("UPDATE schools SET is_deleted = TRUE WHERE id = ?", [
        id,
      ]);
      res.json({ message: "School deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting school", error });
    }
  }
);

// Get All Schools
router.get("/schools", async (req, res) => {
  try {
    const [schools] = await pool.query(`
      SELECT * 
      FROM schools s       
      WHERE s.is_deleted = FALSE
    `);
    res.json(schools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching schools", error });
  }
});

// Get a School
router.get("/schools/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const [schools] = await pool.query(
      `
      SELECT *
      FROM schools
      WHERE id = ?
    `,
      [id]
    );

    if (schools.length === 0) {
      return res.status(404).json({ message: "School not found" });
    }

    res.json(schools[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching school", error });
  }
});

module.exports = router;
