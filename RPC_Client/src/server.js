import express from "express"
import dotenv from "dotenv"
import RabbitMQClient from "./rabbitmq/client.js"
import logger from "./utils/logger.js"
import { validateCalculationRequest } from "./middlewares/validateRequest.middleware.js"

dotenv.config()
const PORT = Number(process.env.PORT) || 3000
const ENVIRONMENT = process.env.NODE_ENV || 'development'
const app = express()
// Middlewares
app.use(express.json())
// Routes
app.post("/api/v1/calculate", validateCalculationRequest, async (req, res, _next) => {
  try {
    const response = await RabbitMQClient.produce(req.body)
    res.json({ answer: response })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

const server = app.listen(PORT, async () => {
  logger.info(`Server running in ${ENVIRONMENT} mode on port ${PORT}...`)
  RabbitMQClient.initialize()
})

// Handle termination signals (CTRL+C, Nodemon restart)
process.on("SIGINT", () => {
  console.log("Shutting down server...")
  server.close(() => {  // ✅ Now we are closing the correct instance
    logger.info("Server shut down successfully.")
    process.exit(0)
  })
})

// Handle process exit to release port
process.on("exit", () => {
  server.close()
})
