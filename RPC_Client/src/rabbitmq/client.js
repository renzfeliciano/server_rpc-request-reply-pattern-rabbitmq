import { connect } from "amqplib"
import config from "../config.js"
import Consumer from "./consumer.js"
import Producer from "./producer.js"
import { EventEmitter } from "events"
import logger from "../utils/logger.js"

class RabbitMQClient {
  constructor() {
    this.isInitialized = false
    this.producer = null
    this.consumer = null
    this.connection = null
    this.producerChannel = null
    this.consumerChannel = null
    this.eventEmitter = new EventEmitter()
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new RabbitMQClient()
    }
    return this.instance
  }

  validateConfig() {
    if (!config.rabbitMQ || !config.rabbitMQ.url) {
        throw new Error("RabbitMQ URL is missing in the configuration")
    }
  }

  async initialize() {
    if (this.isInitialized) {
      return
    }
    this.validateConfig()


    try {
      this.connection = await connect(config.rabbitMQ.url)
      logger.info("[RPC_CLIENT] Connected to RabbitMQ")

      this.producerChannel = await this.connection.createChannel()
      this.consumerChannel = await this.connection.createChannel()
      logger.info("[RPC_CLIENT] Channels created")

      const { queue: replyQueueName } = await this.consumerChannel.assertQueue("", {
        exclusive: true,
      })
      logger.info(`[RPC_CLIENT] Reply queue created: ${replyQueueName}`)

      // Initialize Producer and Consumer
      this.producer = new Producer(
        this.producerChannel,
        replyQueueName,
        this.eventEmitter
      )

      this.consumer = new Consumer(
        this.consumerChannel,
        replyQueueName,
        this.eventEmitter
      )

      await this.consumer.consumeMessages()

      this.isInitialized = true
      logger.info("[RPC_CLIENT] RabbitMQ client initialized")
    } catch (error) {
      logger.error(`[RPC_CLIENT] Error during initialization: ${error}`)
      throw error // Re-throw the error to handle it upstream
    }
  }

  async produce(data) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    return await this.producer.produceMessages(data)
  }
}

export default RabbitMQClient.getInstance()