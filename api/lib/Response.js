const Enum = require("../config/Enum")
const CustomError = require("./CustomError")
const i18n = require('./i18n');

class Response {
    static succes(data, token, code = 200) {
        if (typeof data === "boolean") {
            return {
                code,
                token,
                data: {
                    succes: data
                }
            }
        } else {
            return {
                code,
                token,
                data
            }
        }
    }

    static error(error, lang) {
        if (error instanceof CustomError) {
            return {
                code: error.code,
                error: {
                    message: error.message,
                    description: error.description
                }
            }
        } else if (error.message?.includes("E11000")) {
            return {
                code: Enum.HTTP_CODES.CONFLICT,
                error: {
                    message: i18n.translate("COMMON.ALREADY_EXIST", lang),
                    description: i18n.translate("COMMON.ALREADY_EXIST", lang)
                }
            }
        } else {
            return {
                code: Enum.HTTP_CODES.INT_SERVER_ERROR,
                error: {
                    message: i18n.translate("COMMON.UNKNOWN_ERROR", lang),
                    description: error.message
                }
            }
        }
    }
}

module.exports = Response