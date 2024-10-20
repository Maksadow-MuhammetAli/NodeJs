const Enum = require("../config/Enum")
const CustomError = require("./CustomError")

class Response {
    static succes(data, code = 200) {
        if (typeof data === "boolean") {
            return {
                code,
                data: {
                    succes: data
                }
            }
        } else {
            return {
                code,
                data
            }
        }
    }

    static error(error) {
        if (error instanceof CustomError) {
            return {
                code: error.code,
                error: {
                    message: error.message,
                    description: error.description
                }
            }
        } else if (error.message.includes("E11000")) {
            return {
                code: Enum.HTTP_CODES.CONFLICT,
                error: {
                    message: "Already exists",
                    description: "Already exists"
                }
            }
        } else {
            return {
                code: Enum.HTTP_CODES.INT_SERVER_ERROR,
                error: {
                    message: "Unknown error!",
                    description: error.message
                }
            }
        }
    }
}

module.exports = Response