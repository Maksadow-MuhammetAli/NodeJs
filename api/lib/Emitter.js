const {EventEmitter} = require("events")

let instance = null

class Emitter {
    constructor() {
        if (!instance) {
            this.emitters = {}
            instance = this
        }

        return instance
    }

    addEmitter(name) {
        this.emitters[name] = new EventEmitter(name)

        return this.emitters[name]
    }

    getEmitter(name) {
        return this.emitters[name]
    }
}

module.exports = new Emitter()