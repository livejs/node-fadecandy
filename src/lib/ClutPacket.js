'use strict'

const FadeCandyPacket = require('./FadeCandyPacket')

/*

    In a type 1 packet, the USB packet contains up to 31 lookup-table entries.

    The lookup table is structured as three arrays of 257 entries, starting
    with the entire red-channel LUT, then the green-channel LUT, then the blue-channel LUT.

    https://github.com/scanlime/fadecandy/blob/master/doc/fc_protocol_usb.md#color-lut-packets
*/


module.exports = class ClutPacket extends FadeCandyPacket {

    constructor (data) {
        super()

        this.type = 0b01000000 // 64
        this.max_entries = 62

        if (data) return this.create(data)
    }

    create (data) {

        let pA = this.createPacketArray(data)

        // add reserved byte on index 1
        pA = pA.map((packet) => this.concatTyped(Uint8Array, new Uint8Array(1), packet))

        // add control byte on index 0
        pA = this.setControlBytes(pA)

        return this.createBuffer(pA)
    }
}
