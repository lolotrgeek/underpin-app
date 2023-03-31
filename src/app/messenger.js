import { randomUUID } from 'crypto'

export default class Messenger {
    constructor(core, name=randomUUID()) {
        this.debug = false
        this.name = name 
        this.config = 
        this.core = core
        this.channels = []
    }

    joined(channel) {
        return this.channels.find(joined_channel => joined_channel === channel)
    }

    join(channel) {
        if (typeof channel !== "string") return false
        if (!this.joined(channel)) {
            if (this.debug) console.log(`Joining Channel: ${typeof channel}::${channel}`)
            this.channels.push(channel)
        }

    }

    async listen(channel, listener) {
        this.join(channel)
        await this.core.subscribe(channel, listener)
    }

    async send(channel, message) {
        await this.core.publish(channel, message)
    }

}