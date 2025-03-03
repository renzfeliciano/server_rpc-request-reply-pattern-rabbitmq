import MessageHandler from "../services/messageHandler.service.js"
import logger from "../utils/logger.js"

export default class Consumer {
  constructor(channel, rpcQueue) {
    this.channel = channel
    this.rpcQueue = rpcQueue
  }

  async consumeMessages() {
    if (!this.channel) {
      throw new Error("[RPC_SERVER] Channel is not initialized. Call initialize() first.")
    }

    try {
      logger.info("[RPC_SERVER] Ready to consume messages...")
      
      this.channel.consume(
        this.rpcQueue,
        async (message) => {
          await this.processMessage(message)
          this.channel.ack(message) // Manually acknowledge the message
          logger.info("[RPC_SERVER] Message acknowledged")
        },
        { noAck: false } // Disable automatic acknowledgment
      )
    } catch (error) {
      logger.error(`[RPC_SERVER] Failed to consume messages: ${error}`)
      throw error // Re-throw the error to handle it upstream
    }
    
  }

  async processMessage(message) {
    const { properties, content } = message
    const { correlationId, replyTo, headers } = properties
  
    if (!correlationId || !replyTo) {
      logger.error("[RPC_SERVER] Missing required properties: correlationId or replyTo")
      return
    }
  
    logger.info(`[RPC_SERVER] Correlation ID => ${correlationId}`)
    logger.info(`[RPC_SERVER] ReplyTo => ${replyTo}`)
  
    let parsedContent
    try {
      parsedContent = JSON.parse(content.toString())
    } catch (error) {
      logger.error(`[RPC_SERVER] Failed to parse message content: ${error}`)
      return
    }

    // logger.info(`[RPC_SERVER] headers.function => ${headers?.function}`, )
    // logger.info(`[RPC_SERVER] content.operation => ${parsedContent.operation}`)
    const operation = headers?.function ?? parsedContent.operation
    // logger.info(`[RPC_SERVER] The operation is ${operation}`)
  
    await MessageHandler.handle(
      operation,
      parsedContent,
      correlationId,
      replyTo
    )
  }
}
