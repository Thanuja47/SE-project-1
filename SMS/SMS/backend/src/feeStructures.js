const express = require("express");
const router = express.Router();
const pool = require("./db");
const { authenticate, roleMiddleware } = require("./middleware");

// Get all fee structures
router.get("/", authenticate, async (req, res) => {
  try {
    const [feeStructures] = await pool.query(
      "SELECT * FROM fee_structures WHERE is_deleted = FALSE"
    );
    res.json(feeStructures);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fee structures", error });
  }
});

// Get fee structure by ID
router.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const [feeStructure] = await pool.query(
      "SELECT * FROM fee_structures WHERE id = ? AND is_deleted = FALSE",
      [id]
    );
    if (feeStructure.length === 0)
      return res.status(404).json({ message: "Fee structure not found" });
    res.json(feeStructure[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fee structure", error });
  }
});

// Create a new fee structure
router.post("/", authenticate, roleMiddleware("admin"), async (req, res) => {
  const { course_id, fee_amount } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO fee_structures (course_id, fee_amount) VALUES (?, ?)",
      [course_id, fee_amount]
    );
    res.status(201).json({
      message: "Fee structure created successfully",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating fee structure", error });
  }
});

// Update a fee structure
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
      res.status(500).json({ message: "Error deleting fee structure", error });
    }
  }
);

module.exports = router;
