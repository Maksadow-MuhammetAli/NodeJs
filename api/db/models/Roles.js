const mongoose = require("mongoose")
const RolePrivileges = require("./RolePrivileges")

const schema = mongoose.Schema({
    role_name: {type: String, required: true, unique: true},
    is_active: {type: Boolean, default: true},
    created_by: {type: mongoose.SchemaTypes.ObjectId}
}, {
    versionKey: false,

    // timestamps: true => bul goni createdAt we updatedAt-i berya
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    } // bu bolsa ozin at berip bolya
})

class Roles extends mongoose.Model {
    static async deleteOne(query) {

        const value = await RolePrivileges.deleteMany({role_id: query._id})

        await super.deleteOne(query)
    }
}

schema.loadClass(Roles)

/** @type {import("mongoose").Model} */

module.exports = mongoose.model("roles", schema)