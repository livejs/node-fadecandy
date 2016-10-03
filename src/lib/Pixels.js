'use strict'

const VideoFramePacket = require('./VideoFramePacket')

/*

    In a type 0 packet, the USB packet contains up to 21 pixels of 24-bit RGB color data.
    The last packet (index 24) only needs to contain 8 valid pixels.
    Pixels 9-20 in these packets are ignored.

    https://github.com/scanlime/fadecandy/blob/master/doc/fc_protocol_usb.md#video-packets

*/
module.exports = class Pixels {

    constructor (fadeCandyInterface) {
        this.__fci = fadeCandyInterface
    }

    send (data, cb) {
        let packet = new VideoFramePacket()
        this.__fci.send(packet.create(data), cb)
    }
}

