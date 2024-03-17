const express = require("express");
const router = express.Router();
const db = require("../db");

// Start a new transaction with multiple payment methods
router.post("/", async (req, res, next) => {
  try {
    const { customer_id, total_amount, payment_methods } = req.body;

    // Start a new transaction
    const newTransaction = await db.query(
      "INSERT INTO transactions (customer_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id",
      [customer_id, total_amount, 'Pending']
    );
    const transactionId = newTransaction.rows[0].id;

    // Add payment methods to the transaction
    for (const method of payment_methods) {
      // Check if the payment method exists
      const paymentMethodExists = await db.query(
        "SELECT id FROM payment_methods WHERE id = $1",
        [method.payment_method_id]
      );
      if (!paymentMethodExists.rows.length) {
        return res.status(400).json({ error: `Payment method with ID ${method.payment_method_id} does not exist` });
      }

      await db.query(
        "INSERT INTO transaction_details (transaction_id, payment_method_id, payment_method_name, amount) VALUES ($1, $2, $3, $4)",
        [transactionId, method.payment_method_id, method.payment_method_name, method.amount]
      );
    }

    res.status(201).json({ message: "Transaction created successfully" });
  } catch (err) {
    next(err);
  }
});
// Retrieve all details of a specific transaction including payment methods and customer
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get transaction details
    const transactionResult = await db.query(
      "SELECT t.*, c.name as customer_name, c.email FROM transactions t JOIN customers c ON t.customer_id = c.id WHERE t.id = $1",
      [id]
    );
    const transaction = transactionResult.rows[0];

    // Get payment methods for the transaction
    const paymentMethodsResult = await db.query(
      "SELECT pm.id, pm.name, td.amount FROM payment_methods AS pm JOIN transaction_details AS td ON pm.id = td.payment_method_id WHERE td.transaction_id = $1",
      [id]
    );
    const paymentMethods = paymentMethodsResult.rows;

    res.json({ transaction, paymentMethods });
  } catch (err) {
    next(err);
  }
});

// Update the status of a transaction
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Update transaction status
    const updatedTransaction = await db.query(
      "UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    res.json(updatedTransaction.rows[0]);
  } catch (err) {
    next(err);
  }
});

// List all transactions for a specific customer, including total amount and status
router.get("/customer/:customerId", async (req, res, next) => {
  try {
    const { customerId } = req.params;

    // Fetch all transactions for the customer
    const transactions = await db.query(
      "SELECT id, total_amount, status FROM transactions WHERE customer_id = $1",
      [customerId]
    );

    res.json(transactions.rows);
  } catch (err) {
    next(err);
  }
});

// Calculate the total sales value per customer
router.get("/totalsales/:customerId", async (req, res, next) => {
  try {
    const { customerId } = req.params;

    // Calculate total sales value for the customer
    const totalSales = await db.query(
      "SELECT SUM(total_amount) AS total_sales FROM transactions WHERE customer_id = $1",
      [customerId]
    );

    res.json(totalSales.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
