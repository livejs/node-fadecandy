'use strict'

const FadeCandyPacket = require('./FadeCandyPacket')

/*

    In a type 0 packet, the USB packet contains up to 21 pixels of 24-bit RGB color data.
    The last packet (index 24) only needs to contain 8 valid pixels.
    Pixels 9-20 in these packets are ignored.

    https://github.com/scanlime/fadecandy/blob/master/doc/fc_protocol_usb.md#video-packets
*/


module.exports = class VideoFramePacket extends FadeCandyPacket {

    constructor (data) {
        super()

        this.type = 0b00000000 // 0
        this.max_entries = 63

        if (data) return this.create(data)
    }

    create (data) {

        let pA = this.createPacketArray(data)

        // add control byte on index 0
        pA = this.setControlBytes(pA)

        return this.createBuffer(pA)
    }
}
