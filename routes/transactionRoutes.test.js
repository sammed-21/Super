const request = require("supertest")
const app = require("../app")

describe("Transaction APIs", () => {
  let transactionId

  // Test creating a new transaction
  it("POST /transactions - Create a new transaction", async () => {
    const res = await request(app)
      .post("/transactions")
      .send({
        customerId: 1,
        totalAmount: 100,
        paymentMethods: [
          { name: "Card", amount: 50 },
          { name: "Crypto", amount: 50 }
        ]
      })
    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty("id")
    transactionId = res.body.id
  })

  // Test retrieving a specific transaction
  it("GET /transactions/:id - Get a specific transaction", async () => {
    const res = await request(app).get(`/transactions/${transactionId}`)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty("id", transactionId)
  })

  // Test updating the status of a transaction
  it("PUT /transactions/:id - Update the status of a transaction", async () => {
    const res = await request(app)
      .put(`/transactions/${transactionId}`)
      .send({ status: "Completed" })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty("id", transactionId)
    expect(res.body).toHaveProperty("status", "Completed")
  })

  // Test listing all transactions for a specific customer
  it("GET /transactions?customerId=:id - List all transactions for a specific customer", async () => {
    const res = await request(app).get(`/transactions?customerId=1`)
    expect(res.statusCode).toEqual(200)
    expect(Array.isArray(res.body)).toBeTruthy()
  })

  // Test calculating the total sales value per customer
  it("GET /transactions/total-sales?customerId=:id - Calculate total sales value per customer", async () => {
    const res = await request(app).get(`/transactions/total-sales?customerId=1`)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty("customerId", 1)
    expect(res.body).toHaveProperty("totalSales")
  })
})
