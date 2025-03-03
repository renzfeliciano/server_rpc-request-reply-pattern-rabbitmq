import dotenv from "dotenv"

dotenv.config()

export default { 
  rabbitMQ: {
    url: process.env.RABBITMQ_URL || "amqp://localhost",
    queues: {
      rpcQueue: process.env.RPCQUEUE || "rpc_queue"
    },
    outputFile: process.env.OUTPUT_FILE || "output.txt"
  }
}