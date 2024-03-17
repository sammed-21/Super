const express = require("express")
const router = express.Router()
const db = require("../db")

// Get all customers
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM customers")
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
})

// Get a single customer by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await db.query("SELECT * FROM customers WHERE id = $1", [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

// Create a new customer
router.post("/", async (req, res, next) => {
  try {
    const { name, email } = req.body
    const result = await db.query("INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING *", [name, email])
    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

// Update a customer by ID
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, email } = req.body
    const result = await db.query("UPDATE customers SET name = $1, email = $2 WHERE id = $3 RETURNING *", [name, email, id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

// Delete a customer by ID
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await db.query("DELETE FROM customers WHERE id = $1 RETURNING *", [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" })
    }
    res.json({ message: "Customer deleted successfully" })
  } catch (err) {
    next(err)
  }
})

module.exports = router
