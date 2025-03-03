import fs from "fs"
import logger from "../utils/logger.js"

export default class FileService {
    static async saveToFile(filePath, content) {
        return new Promise((resolve, reject) => {
            fs.appendFile(filePath, content + "\n", (err) => {
                if (err) {
                    logger.error(`[RPC_SERVER] Error writing to file: ${err.message}`)
                    reject(err)
                } else {
                    logger.info(`[RPC_SERVER] Message saved to ${filePath}`)
                    resolve()
                }
            })
        })
    }
}