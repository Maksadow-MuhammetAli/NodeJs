const express = require("express")
const fs = require("fs")
const router = express.Router()
const Categories = require("../db/models/Categories")
const Response = require("../lib/Response")
const CustomError = require("../lib/CustomError")
const Enum = require("../config/Enum")
const AuditLogs = require("../lib/AuditLogs")
const logger = require("../lib/logger/LoggerClass")

const auth = require("../lib/auth")()
const I18n = require("../lib/i18n")
const emitter = require("../lib/Emitter")
const Export = require("../lib/Export")

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
        if (!body.name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["name"]))

        let category = new Categories({
            name: body.name,
            is_active: true,
            created_by: req.user?.id
        })

        await category.save()

        AuditLogs.info(req.user?.email, "Categories", "Add", category)
        logger.info(req.user?.id, "Categories", "Add", category)
        emitter.getEmitter("notifications").emit("messages", {message: `${category.name} is added`})


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
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["_id"]))
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
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["_id"]))

        await Categories.deleteOne(({_id: body._id}))

        AuditLogs.info(body.user?.email, "Categories", "Delete", {_id: body._id})


        res.json(Response.succes(true, req.user.token))
    } catch (error) {
        let err = Response.error(error)
        res.status(err.code).json(err)
    }
})

router.get("/export", auth.checkRoles("category_export"), async (req, res) => {
    try {
        const categories = await Categories.find()

        let excel = Export.toExcel(["ID", "CATEGORY NAME", "IS ACTIVE", "USER ID", "CREATED AT", "UPDATED AT"], ["_id", "name", "is_active", "created_by", "created_at", "updated_at"], categories)

        const filePath = `${__dirname}/../tmp/categories_excel_${Date.now()}.xlsx`

        fs.writeFileSync(filePath, excel, "UTF-8")

        res.download(filePath)

        setTimeout(() => {
            fs.unlinkSync(filePath)
        }, 1000)

    } catch (error) {
        let err = Response.error(error)
        res.status(err.code).json(err)
    }
})

module.exports = router