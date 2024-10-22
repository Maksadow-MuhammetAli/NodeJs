const mongoose = require("mongoose")

const schema = mongoose.Schema({
    level: String,
    email: String,
    location: String,
    proc_type: String,
    log: mongoose.SchemaTypes.Mixed
}, {
    versionKey: false,

    // timestamps: true => bul goni createdAt we updatedAt-i berya
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    } // bu bolsa ozin at berip bolya
})

class AuditLogs extends mongoose.Model {

}

schema.loadClass(AuditLogs)

module.exports = mongoose.model("audit_logs", schema)