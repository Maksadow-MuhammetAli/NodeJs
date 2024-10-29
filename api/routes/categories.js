const express = require("express")
const router = express.Router()
const Categories = require("../db/models/Categories")
const Response = require("../lib/Response")
const CustomError = require("../lib/CustomError")
const Enum = require("../config/Enum")
const AuditLogs = require("../lib/AuditLogs")
const logger = require("../lib/logger/LoggerClass")

const auth = require("../lib/auth")()

router.all("*", auth.authenticate(), (req, res, next) => {
    next()
})

router.get("/", auth.checkRoles("category_view"), async (req, res, next) => {
    try {
        let categories = await Categories.find({})

        res.json(Response.succes(categories, req.user.token))
    } catch (error) {
        let errorResponse = Response.error(error)
        res.status(errorResponse.code).json(errorResponse)
    }
})

router.post("/add", auth.checkRoles("category_add"), async (req, res, next) => {
    let body = req.body
    try {
        if (!body.name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "name field must be filled")

        let category = new Categories({
            name: body.name,
            is_active: true,
            created_by: req.user?.id
        })

        await category.save()

        AuditLogs.info(req.user?.email, "Categories", "Add", category)
        logger.info(req.user?.id, "Categories", "Add", category)


        res.json(Response.succes(true, req.user.token))

    } catch (error) {
        logger.error(req.user?.id, "Catedories", "Add", error)
        let errorResponse = Response.error(error)
        res.status(errorResponse.code).json(errorResponse)
    }
})

router.put("/update", auth.checkRoles("category_update"), async (req, res) => {
    let body = req.body
    try {
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled")
        let updates = {}

        if (body.name) updates.name = body.name
        if (typeof body.is_active === "boolean") updates.is_active = body.is_active

        await Categories.updateOne({_id: body._id}, updates)

        AuditLogs.info(body.user?.email, "Categories", "Update", {_id: body._id, ...updates})

        res.json(Response.succes(true, req.user.token))
    } catch (error) {
        let errorResponse = Response.error(error)
        res.status(errorResponse.code).json(errorResponse)
    }
})

router.delete("/delete", auth.checkRoles("category_delete"), async (req, res) => {
    let body = req.body

    try {
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled")

        await Categories.deleteOne(({_id: body._id}))

        AuditLogs.info(body.user?.email, "Categories", "Delete", {_id: body._id})


        res.json(Response.succes(true, req.user.token))
    } catch (error) {
        let errorResponse = Response.error(error)
        res.status(errorResponse.code).json(errorResponse)
    }
})

module.exports = router