const express = require("express")
const router = express.Router()
const moment = require("moment")

const Response = require("../lib/Response")
const AuditLogs = require("../db/models/AuditLogs")
const auth = require("../lib/auth")()

router.all("*", auth.authenticate(), (req, res, next) => {
    next()
})

router.post("/", async (req, res) => {
    try {
        let body = req.body
        let query = {}
        let limit = typeof body.limit == "number" ? body.limit : 500
        let skip = typeof body.skip == "number" ? body.skip : 0

        if (body.begin_date && body.end_date) {
            query.created_at = {
                $gte: moment(body.begin_date),
                $lte: moment(body.end_date)
            }
        } else {
            query.created_at = {
                $gte: moment().subtract(1, "day").startOf("day"),
                $lte: moment()
            }
        }

        const auditLogs = await AuditLogs.find(query).sort({created_at: -1}).skip(skip).limit(limit)

        res.json(Response.succes(auditLogs, req.user.token))


    } catch (error) {
        const err = Response.error(error)
        res.status(err.code).json(err)
    }
})

module.exports = router