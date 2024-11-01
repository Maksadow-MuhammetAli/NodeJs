const passport = require("passport")
const {ExtractJwt, Strategy} = require("passport-jwt")
const jwt = require("jwt-simple")

const config = require("../config")
const Users = require("../db/models/Users")
const UserRoles = require("../db/models/UserRoles")
const RolePrivileges = require("../db/models/RolePrivileges")
const Roles = require("../db/models/Roles")
const configPrivs = require("../config/RolePrivileges")
const Response = require("./Response")
const Enum = require("../config/Enum")
const CustomError = require("./CustomError")

module.exports = () => {
    const strategy = new Strategy({
        secretOrKey: config.JWT.SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }, async (payload, done) => {
        try {
            let user = await Users.findOne({_id: payload.id})

            if (user) {
                const userRoles = await UserRoles.find({user_id: user._id})
                const roles = await Roles.find({_id: {$in: userRoles.map(x => x.role_id)}})
                const rolePrivileges = await RolePrivileges.find({role_id: {$in: userRoles.map(x => x.role_id)}})

                const privileges = rolePrivileges.map(rp => configPrivs.privileges.find(x => x.key == rp.permission))

                let payload = {
                    id: user._id,
                    exp: parseInt(Date.now() / 1000) + config.JWT.EXPIRE_TIME
                }

                let token = jwt.encode(payload, config.JWT.SECRET)

                done(null, {
                    id: user._id,
                    email: user.email,
                    roles,
                    role_privileges: privileges,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    language: user.language,
                    token
                })
            } else {
                done(new Error("User not found"), null)
            }
        } catch (error) {
            done(error, null)
        }
    })

    passport.use(strategy)

    return {
        initialize: () => {
            return passport.initialize()
        },
        authenticate: () => {
            return passport.authenticate("jwt", {session: false})
        },
        checkRoles: (...expectedRoles) => {
            return (req, res, next) => {
                try {
                    let i = 0
                    let privileges = req.user.role_privileges.map(x => x.key)

                    while (i < expectedRoles.length && !privileges.includes(expectedRoles[i])) i++

                    if (i >= expectedRoles.length) {
                        let err = Response.error(new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Need permission", "You don't have a permission to access this endpoint"))
                        res.status(err.code).json(err)
                    } else {
                        return next()
                    }
                } catch (error) {
                    let err = Response.error(error)
                    res.status(err.code).json(err)
                }
            }
        }
    }
}