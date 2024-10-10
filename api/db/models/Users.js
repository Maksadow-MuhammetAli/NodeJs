const mongoose = require("mongoose")

const schema = mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    is_active: {type: Boolean, default: true},
    first_name: String,
    last_name: String,
    phone_number: String
}, {
    // timestamps: true => bul goni createdAt we updatedAt-i berya
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    } // bu bolsa ozin at berip bolya
})

class Users extends mongoose.Model {

}

schema.loadClass(Users)

module.exports = mongoose.model("users", schema)