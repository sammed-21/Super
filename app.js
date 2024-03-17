const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const Transaction = require('./routes/transactionRoutes')
const Customer = require('./routes/customerRoutes')
 
const { NotFoundError } = require("./utils/errors")

const app = express()
 
app.use(cors())
 
app.use(express.json())
// log requests info
app.use(morgan("tiny")) 
 
app.use('/transactions',Transaction)
app.use('/customers',Customer)


app.get("/", (req, res, next) => {
  res.status(200).json({ ping: "pong" })
})

/** Handle 404 errors -- this matches everything */
app.use((req, res, next) => {
  return next(new NotFoundError())
})

/** Generic error handler; anything unhandled goes here. */
app.use((err, req, res, next) => {
  const status = err.status || 500
  const message = err.message

  return res.status(status).json({
    error: { message, status },
  })
})

module.exports = app
