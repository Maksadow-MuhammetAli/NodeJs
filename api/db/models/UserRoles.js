const mongoose = require("mongoose")

const schema = mongoose.Schema({
    role_id: {type: mongoose.SchemaTypes.ObjectId, required: true},
    user_id: {type: mongoose.SchemaTypes.ObjectId, required: true}
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

module.exports = mongoose.model("user_roles", schema)