const express = require('express');
const router = express.Router()
const Response = require("../lib/Response")

const Roles = require("../db/models/Roles");
const CustomError = require('../lib/CustomError');
const Enum = require('../config/Enum');
const roleprivileges = require("../config/RolePrivileges")
const RolePrivileges = require("../db/models/RolePrivileges");
const I18n = require('../lib/i18n');

const auth = require("../lib/auth")()

router.all("*", auth.authenticate(), (req, res, next) => {
    next()
})

router.get("/", auth.checkRoles("role_view"), async (req, res) => {
    try {
        let roles = await Roles.find().lean()  //= .lean() => bu function model objesini javascript objesine owurya

        //` roles = JSON.parse(JSON.stringify(roles))

        for (let i = 0; i < roles.length; i++) {
            const permissions = await RolePrivileges.find({role_id: roles[i]._id})

            roles[i].permissions = permissions
        }

        res.json(Response.succes(roles, req.user.token))
    } catch (error) {
        const err = Response.error(error)
        res.status(err.code).json(err)
    }
})

router.post("/add", auth.checkRoles("role_add"), async (req, res) => {
    let body = req.body
    try {
        if (!body.role_name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["role_name"]))
        if (!body.permissions || !Array.isArray(body.permissions) || body.permissions.length === 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.FIELD_MUST_BE_TYPE", req.user?.language, ["permission", "array"]))
        }

        const role = new Roles({
            role_name: body.role_name,
            is_active: true,
            created_by: req.user?.id
        })

        await role.save()

        body.permissions.forEach(async permission => {
            let priv = new RolePrivileges({
                role_id: role._id,
                permission,
                created_by: req.user?.id
            })

            await priv.save()
        });

        res.json(Response.succes(true, req.user.token))
    } catch (error) {
        const err = Response.error(error)
        res.status(err.code).json(err)
    }
})

router.put("/update", auth.checkRoles("role_update"), async (req, res) => {
    let body = req.body
    let update = {}
    try {
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["_id"]))

        if (body.permissions && Array.isArray(body.permissions) && body.permissions.length !== 0) {

            const permissions = await RolePrivileges.find({role_id: body._id})

            // body.permission => [category_view, user_add, role_update]
            // DB permissions => [{_id: asd, role_id: fgh, permission: "user_add"}]

            const removedPermissions = permissions.filter(x => !body.permissions.includes(x.permission))
            const newPermissions = body.permissions.filter(x => !permissions.map(y => y.permission).includes(x))

            if (removedPermissions.length > 0) {
                await RolePrivileges.deleteMany({_id: {$in: removedPermissions.map(x => x._id)}})
            }

            if (newPermissions.length > 0) {
                newPermissions.forEach(async newPermission => {
                    let priv = new RolePrivileges({
                        role_id: body._id,
                        permission: newPermission,
                        created_by: req.user?.id
                    })

                    await priv.save()
                });
            }
        }


        if (body.role_name) update.role_name = body.role_name
        if (typeof body.is_active === "boolean") update.is_active = body.is_active

        await Roles.updateOne({_id: body._id}, update)

        res.json(Response.succes(true, req.user.token))
    } catch (error) {
        const err = Response.error(error)
        res.status(err.code).json(err)
    }
})

router.delete("/delete", auth.checkRoles("role_delete"), async (req, res) => {
    let body = req.body
    try {
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, I18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), I18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["_id"]))

        await Roles.deleteOne({_id: body._id})

        res.json(Response.succes(true, req.user.token))
    } catch (error) {
        const err = Response.error(error)
        res.status(err.code).json(err)
    }
})

router.get("/role_privileges", async (req, res) => {
    res.json(roleprivileges)
})


module.exports = router