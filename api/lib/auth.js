const passport = require("passport")
const {ExtractJwt, Strategy} = require("passport-jwt")

const config = require("../config")
const Users = require("../db/models/Users")
const UserRoles = require("../db/models/UserRoles")
const RolePrivileges = require("../db/models/RolePrivileges")
const Roles = require("../db/models/Roles")

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

                done(null, {
                    id: user._id,
                    email: user.email,
                    roles,
                    role_privileges: rolePrivileges,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    exp: parseInt(Date.now() / 1000) + config.JWT.EXPIRE_TIME
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
        }
    }
}