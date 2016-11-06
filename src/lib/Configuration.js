'use strict'

const ConfigurationPacket = require('./ConfigurationPacket')

const schema = {
    MODE: 'mode',
    LED_STATUS: 'led_status',
    LED_MODE: 'led_mode',
    DISABLE_KEYFRAME_INTERPOLATION: 'disable_keyframe_interpolation',
    DISABLE_DITHERING: 'disable_dithering'
}

const defaults = {
    [schema.MODE]: 0,
    [schema.LED_STATUS]: 0,
    [schema.LED_MODE]: 0,
    [schema.DISABLE_KEYFRAME_INTERPOLATION]: 0,
    [schema.DISABLE_DITHERING]: 0
}

const bitmask = {
    [schema.MODE]: 0b00010000, // 16
    [schema.LED_STATUS]: 0b00001000, // 8
    [schema.LED_MODE]: 0b00000100, // 4
    [schema.DISABLE_KEYFRAME_INTERPOLATION]: 0b00000010, // 2
    [schema.DISABLE_DITHERING]: 0b00000001 // 1
}

module.exports = class Configuration {

    constructor(
        defaultConfiguration = defaults,
        fadeCandyInterface
    ) {
        this.__configuration = defaults
        this.__fci = fadeCandyInterface
        this.__update(defaultConfiguration)
    }

    set (key, value) {
        if (typeof key !== 'string') return this.__update(key)

        this.__update({
            [key]: value
        })
    }

    get (key) {
        if (!key) return this.__configuration

        return this.__configuration[key]
    }

    static get schema () {
        return schema;
    }

    __update (obj) {

        if (!this.__validate(obj)) throw new Error('Invalid configuration!')

        Object.assign(this.__configuration, obj);

        this.__fci.send(this.__createPacket())
    }

    __validate (obj) {
        return Object.keys(obj).reduce((prev, current) => {
            if (!prev) return prev

            return !!schema[current.toUpperCase()]
        }, true)
    }

    __createPacket () {
        let packet = new ConfigurationPacket()
        let data = new Uint8Array(1)

        Object.keys(this.__configuration).forEach((key) => {
            if (!!this.__configuration[key]) data[0] = data[0] | bitmask[key]
        })

        return packet.create(data)
    }

}