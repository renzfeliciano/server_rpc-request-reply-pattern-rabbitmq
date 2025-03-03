import logger from "../utils/logger.js"

export default class Producer {
  constructor(channel) {
    this.channel = channel
  }

  async produceMessages(
    data,
    correlationId,
    replyToQueue
  ) {
    try {
      logger.info(`[RPC_SERVER] Responding with.. ${data}`)
      this.channel.sendToQueue(replyToQueue, Buffer.from(JSON.stringify(data)), {
        correlationId
      })
    } catch (error) {
      logger.error(`[RPC_SERVER] Failed to produce messages: ${error}`)
      throw error // Re-throw the error to handle it upstream
    }
  }
}
