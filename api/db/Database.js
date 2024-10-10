const mongoose = require("mongoose")

let instance = null

class Database {
    constructor() {
        this.mongoConnection = null
        if (!instance) {
            instance = this
        }

        return instance
    }

    async connect(options) {
        console.log(`DB connecting ...`)
        try {
            let db = await mongoose.connect(options.CONNECTION_STRING)

            this.mongoConnection = db
            console.log(`DB connected to ${options.CONNECTION_STRING}`)
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    }
}

module.exports = Database