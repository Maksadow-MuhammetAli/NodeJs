const mongoose = require("mongoose")

const schema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
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

class Categories extends mongoose.Model {

}

schema.loadClass(Categories)

/** @type {import("mongoose").Model} */

module.exports = mongoose.model("categories", schema)