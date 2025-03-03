import { randomUUID } from "crypto"
import config from "../config.js"
import logger from "../utils/logger.js"

export default class Producer {
  constructor(channel, replyQueueName, eventEmitter) {
    this.channel = channel
    this.replyQueueName = replyQueueName
    this.eventEmitter = eventEmitter
  }

  async produceMessages(data) {
    try {
      const correlationId = randomUUID()
      logger.info(`[RPC_CLIENT] Correlation ID => ${correlationId}`)
      const expiration = Number(process.env.RABBITMQ_EXPIRATION) || 5000
      this.channel?.sendToQueue(
        config.rabbitMQ.queues.rpcQueue,
        Buffer.from(JSON.stringify(data)),
        {
          replyTo: this.replyQueueName,
          correlationId,
          expiration,
          headers: {
            function: data.operation
          }
        }
      )

      const responsePromise = new Promise((resolve, reject) => {
        // Set a timeout to reject the promise if no response is received
        const timeout = setTimeout(() => {
          this.eventEmitter.removeAllListeners(correlationId) // Cleanup listener
          reject(new Error("[RPC_CLIENT] Request timed out"))
        }, expiration) // Timeout after 5 seconds
      
        // Listen for the response
        this.eventEmitter.once(correlationId, async (data) => {
          clearTimeout(timeout)
          this.eventEmitter.removeAllListeners(correlationId)

          try {
            if (data?.properties?.correlationId === correlationId) { // validate incoming correlation ID
              resolve(JSON.parse(data.content.toString()))
            } else {
              reject(new Error("[RPC_CLIENT] Invalid Correlation ID"))
            }
          } catch (error) {
            reject(new Error("[RPC_CLIENT] Failed to parse response"))
          }
        })
      })

      return await responsePromise
    } catch (error) {
      logger.error(`[RPC_CLIENT] Failed to produce messages: ${error}`)
      throw error // Re-throw the error to handle it upstream
    }
  }
}
