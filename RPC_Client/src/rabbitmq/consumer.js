import logger from "../utils/logger.js"

export default class Consumer {
  constructor(channel, replyQueueName, eventEmitter) {
    this.channel = channel
    this.replyQueueName = replyQueueName
    this.eventEmitter = eventEmitter
  }

  async consumeMessages() {
    if (!this.channel) {
      throw new Error("Channel is not initialized. Call initialize() first.")
    }

    try {
      logger.info("[RPC_CLIENT] Ready to consume messages...")
      this.channel.consume(
        this.replyQueueName,
        (message) => {
          const { properties, content } = message
          const { correlationId } = properties
          logger.info(`[RPC_CLIENT] the reply is.. ${JSON.parse(content.toString())}`)
          this.eventEmitter.emit(
            correlationId.toString(),
            message
          )
        },
        {
          noAck: true,
        }
      )
    } catch (error) {
      logger.error(`[RPC_CLIENT] Failed to consume messages: ${error}`)
      throw error // Re-throw the error to handle it upstream
    }
  }
}
