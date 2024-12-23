const mongoose = require("mongoose")
// const is = require("is_js")
const validator = require("validator")
const bcrypt = require("bcrypt-nodejs")

const CustomError = require("../../lib/CustomError")
const {PASS_LENGTH, HTTP_CODES} = require("../../config/Enum")
const config = require("../../config")

const schema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    is_active: {type: Boolean, default: true},
    first_name: String,
    last_name: String,
    phone_number: String,
    language: {type: String, default: config.DEFAULT_LANG}
}, {
    versionKey: false,

    // timestamps: true => bul goni createdAt we updatedAt-i berya
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    } // bu bolsa ozin at berip bolya
})

class Users extends mongoose.Model {
    static validateFielsBeforeAuth(email, password) {
        if (!validator.isEmail(email)) throw new CustomError(HTTP_CODES.BAD_REQUEST, "Validation Error", "Email field must be email format")
        if (typeof password != "string" || password.length < PASS_LENGTH) throw new CustomError(HTTP_CODES.UNAUTHORIZED, "Validation Error", "Password field wrong")
    }

    validPassword(password) {
        return bcrypt.compareSync(password, this.password)
    }
}

schema.loadClass(Users)

/** @type {import("mongoose").Model} */

module.exports = mongoose.model("users", schema)