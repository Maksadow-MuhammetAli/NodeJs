const express = require("express")
const router = express.Router()

const Enum = require("../config/Enum")
const emitter = require("../lib/Emitter")
const Response = require("../lib/Response")
const {EN} = require("../i18n")

emitter.addEmitter("notifications")

router.get("/", async (req, res) => {
    try {
        res.writeHead(Enum.HTTP_CODES.OK, {
            "Content-Type": "text/event-stream",
            "Connection": "keep-alive",
            "Cache-control": "no-cache, no-transform"
        })

        const listener = (data) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`)
        }

        emitter.getEmitter("notifications").on("messages", listener)

        req.on("close", () => {
            emitter.getEmitter("notifications").off("messages", listener)
        })
    } catch (error) {
        const err = Response.error(error, EN)
        res.status(err.code).json(err)
    }
})

module.exports = router