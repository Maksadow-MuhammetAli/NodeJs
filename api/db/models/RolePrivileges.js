const mongoose = require("mongoose")

const schema = mongoose.Schema({
    role_id: {type: mongoose.SchemaTypes.ObjectId, required: true},
    permission: {type: String, required: true},
    created_by: {type: mongoose.SchemaTypes.ObjectId}
}, {
    toJSON: {versionKey: false},

    // timestamps: true => bul goni createdAt we updatedAt-i berya
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    } // bu bolsa ozin at berip bolya
})

class RolePrivileges extends mongoose.Model {

}

schema.loadClass(RolePrivileges)

module.exports = mongoose.model("role_privileges", schema)