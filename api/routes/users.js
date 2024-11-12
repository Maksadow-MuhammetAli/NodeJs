const express = require("express")
const bcrypt = require("bcrypt-nodejs")
const router = express.Router()
// const is = require("is_js")
const validator = require("validator")
const jwt = require("jwt-simple")
const rolePrivs = [...(require("../config/RolePrivileges").privileges)].map(x => x.key)

const Users = require("../db/models/Users")
const UserRoles = require("../db/models/UserRoles")
const RolePrivileges = require("../db/models/RolePrivileges")
const Roles = require("../db/models/Roles")
const Response = require("../lib/Response")
const CustomError = require("../lib/CustomError")
const Enum = require("../config/Enum")
const config = require("../config")

const auth = require("../lib/auth")()
const I18n = require('../lib/i18n');

router.post("/register", async (req, res) => {// validator.js
    let body = req.body
    try {

        const user = await Users.findOne()

        if (user) {
            return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND)
        }

        if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["email"]))
        if (!validator.isEmail(body.email)) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("USERS.EMAIL_FORMAT_ERROR", req.user?.language))
        }

        if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["password"]))
        if (body.password.length < Enum.PASS_LENGTH) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.PASSWORD_LENGTH_ERROR", req.user?.language, [Enum.PASS_LENGTH]))
        }

        const password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null)

        const createdUser = await Users.create({
            email: body.email,
            password,
            is_active: true,
            first_name: body.first_name,
            last_name: body.last_name,
            phone_number: body.phone_number
        })

        const role = await Roles.create({
            role_name: Enum.SUPER_ADMIN,
            is_active: true,
            created_by: createdUser._id
        })

        console.log(rolePrivs)

        rolePrivs.forEach(rolePriv => {
            RolePrivileges.create({
                role_id: role,
                permission: rolePriv,
                created_by: createdUser._id
            })
        })


        await UserRoles.create({
            role_id: role._id,
            user_id: createdUser._id
        })

        let payload = {
            id: createdUser._id,
            exp: parseInt(Date.now() / 1000) + config.JWT.EXPIRE_TIME
        }

        let token = jwt.encode(payload, config.JWT.SECRET)

        res.status(Enum.HTTP_CODES.CREATED).json(Response.succes(true, token, Enum.HTTP_CODES.CREATED))
    } catch (error) {
        const err = Response.error(error)
        res.status(err.code).json(err)
    }
})

router.post("/auth", async (req, res) => {
    try {
        let {email, password} = req.body

        Users.validateFielsBeforeAuth(email, password)

        let user = await Users.findOne({email})

        if (!user) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("USERS.AUTH_ERROR", req.user?.language))

        if (!user.validPassword(password)) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("USERS.AUTH_ERROR", req.user?.language))

        // console.log("aaaa")
        let payload = {
            id: user._id,
            exp: parseInt(Date.now() / 1000) + config.JWT.EXPIRE_TIME
        }

        let token = jwt.encode(payload, config.JWT.SECRET)

        let userData = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name
        }

        res.json(Response.succes({token, user: userData}))
    } catch (error) {
        const err = Response.error(error)
        res.status(err.code).json(err)
    }
})

router.all("*", auth.authenticate(), (req, res, next) => {
    next()
})

router.get("/", auth.checkRoles("user_view"), async (req, res) => {
    try {
        const users = await Users.find()

        res.json(Response.succes(users, req.user.token))
    } catch (error) {
        const err = Response.error(error)
        res.status(err.code).json(err)
    }
})

router.post("/add", /*auth.checkRoles("user_add"),*/ async (req, res) => {
    let body = req.body
    try {
        if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["email"]))
        if (!validator.isEmail(body.email)) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("USERS.EMAIL_FORMAT_ERROR", req.user?.language))
        }

        if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["password"]))
        if (body.password.length < Enum.PASS_LENGTH) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.PASSWORD_LENGTH_ERROR", req.user?.language, [Enum.PASS_LENGTH]))
        }

        if (!body.roles || !Array.isArray(body.roles) || body.roles.length == 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["roles"]))
        }

        const roles = await Roles.find({_id: {$in: body.roles}})

        if (roles.length == 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.FIELD_IS_WRONG", req.user?.language, ["roles"]))
        }

        const password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null)

        const user = await Users.create({
            email: body.email,
            password,
            is_active: true,
            first_name: body.first_name,
            last_name: body.last_name,
            phone_number: body.phone_number
        })

        roles.forEach(async role => {
            await UserRoles.create({
                role_id: role._id,
                user_id: user._id
            })
        });

        res.status(Enum.HTTP_CODES.CREATED).json(Response.succes(true, req.user.token, Enum.HTTP_CODES.CREATED))
    } catch (error) {
        const err = Response.error(error)
        res.status(err.code).json(err)
    }
})

router.put("/update", auth.checkRoles("user_update"), async (req, res) => {
    let body = req.body
    let updates = {}
    try {
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["_id"]))


        if (body.password) {
            if (body.password.length < Enum.PASS_LENGTH) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("USERS.PASSWORD_LENGTH_ERROR", req.user?.language, [Enum.PASS_LENGTH]))

            updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null)
        }


        if (typeof body.is_active === "boolean") updates.is_active = body.is_active
        if (body.first_name) updates.first_name = body.first_name
        if (body.last_name) updates.last_name = body.last_name
        if (body.phone_number) updates.phone_number = body.phone_number

        if (body.roles || Array.isArray(body.roles) || body.roles.length > 0) {
            const dbUserRoles = await UserRoles.find({user_id: body._id})
            const bodyUserRoles = body.roles

            const removedRoles = dbUserRoles.filter(x => !bodyUserRoles.includes(x.role_id))
            const newUserRoles = bodyUserRoles.filter(x => !dbUserRoles.map(x => x.role_id).includes(x))

            if (removedRoles.length != 0) {
                await UserRoles.deleteMany({_id: {$in: removedRoles.map(x => x._id)}})
            }

            if (newUserRoles.length != 0) {
                newUserRoles.forEach(async newUserRole => {
                    await UserRoles.create({
                        role_id: newUserRole,
                        user_id: body._id
                    })
                })
            }
        }

        await Users.updateOne({_id: body._id}, updates)

        res.json(Response.succes(true, req.user.token))
    } catch (error) {
        const err = Response.error(error)
        res.status(err.code).json(err)
    }
})

router.delete("/delete", auth.checkRoles("user_delete"), async (req, res) => {
    let body = req.body
    try {
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["_id"]))

        await Users.deleteOne({_id: body._id})

        await UserRoles.deleteMany({user_id: body._id})

        res.json(Response.succes(true, req.user.token))
    } catch (error) {
        const err = Response.error(error)
        res.status(err.code).json(err)
    }
})

module.exports = router