const mongoose = require("mongoose")
const Roles = require("./Roles")
const Users = require("./Users")

const schema = mongoose.Schema({
    role_id: {type: mongoose.SchemaTypes.ObjectId, required: true, ref: Roles},
    user_id: {type: mongoose.SchemaTypes.ObjectId, required: true, ref: Users}
}, {
    versionKey: false,

    // timestamps: true => bul goni createdAt we updatedAt-i berya
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    } // bu bolsa ozin at berip bolya
})

class UserRoles extends mongoose.Model {

}

schema.loadClass(UserRoles)

/** @type {import("mongoose").Model} */

module.exports = mongoose.model("user_roles", schema)