import { connect } from "amqplib"
import config from "../config.js"
import Consumer from "./consumer.js"
import Producer from "./producer.js"
import logger from "../utils/logger.js"

class RabbitMQClient {
  constructor() {
    this.instance = null
    this.isInitialized = false
    this.producer = null
    this.consumer = null
    this.connection = null
    this.producerChannel = null
    this.consumerChannel = null
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new RabbitMQClient()
    }
    return this.instance
  }

  async initialize() {
    if (this.isInitialized) {
      return
    }
    try {
      this.connection = await connect(config.rabbitMQ.url)
      logger.info("[RPC_SERVER] Connected to RabbitMQ")

      this.producerChannel = await this.connection.createChannel()
      this.consumerChannel = await this.connection.createChannel()
      logger.info("[RPC_SERVER] Channels created")

      const { queue: rpcQueue } = await this.consumerChannel.assertQueue(
        config.rabbitMQ.queues.rpcQueue,
        { exclusive: true }
      )
      logger.info(`[RPC_SERVER] Reply queue created: ${rpcQueue}`)

      // Initialize Producer and Consumer
      this.producer = new Producer(this.producerChannel)
      this.consumer = new Consumer(this.consumerChannel, rpcQueue)

      await this.consumer.consumeMessages()

      this.isInitialized = true
      logger.info("[RPC_SERVER] RabbitMQ client initialized")
    } catch (error) {
      logger.error(`[RPC_SERVER] rabbitmq error... ${error}`)
    }
  }

  async produce(data, correlationId, replyToQueue) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    return await this.producer.produceMessages(
      data,
      correlationId,
      replyToQueue
    )
  }
}

export default RabbitMQClient.getInstance()
