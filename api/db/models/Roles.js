const mongoose = require("mongoose")

const schema = mongoose.Schema({
    role_name: {type: String, required: true},
    is_active: {type: Boolean, default: true},
    created_by: {type: mongoose.SchemaTypes.ObjectId, required: true}
}, {
    // versionKey: false, => versionKey ayyrya

    // timestamps: true => bul goni createdAt we updatedAt-i berya
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    } // bu bolsa ozin at berip bolya
})

class Roles extends mongoose.Model {

}

schema.loadClass(Roles)

module.exports = mongoose.model("roles", schema)