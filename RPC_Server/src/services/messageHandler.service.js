import rabbitClient from "../rabbitmq/client.js"
import FileService from "./file.service.js"
import config from "../config.js"
import { performOperation } from "./calculate.service.js"

export default class MessageHandler {
    static async handle(operation, data, correlationId, replyTo) {
        const { num1, num2 } = data
        const { answer, operator } = performOperation(operation, num1, num2)
        const response = `${num1} ${operator} ${num2} = ${answer}`
        // Saves the message content to a file.
        await FileService.saveToFile(config.rabbitMQ.outputFile, response)
        // Produce the response back to the client
        await rabbitClient.produce(answer, correlationId, replyTo)
    }
}