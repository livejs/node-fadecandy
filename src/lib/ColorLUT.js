'use strict'

const EventEmitter = require('events');
const ClutPacket = require('./ClutPacket')

const events = {
    READY: 'ready'
}

/*

    In a type 1 packet, the USB packet contains up to 31 lookup-table entries.

    The lookup table is structured as three arrays of 257 entries, starting
    with the entire red-channel LUT, then the green-channel LUT, then the blue-channel LUT.

    default LUT generated based on this example in python
    https://github.com/scanlime/fadecandy/blob/master/examples/python/usb-lowlevel.py

*/
module.exports = class ColorLUT extends EventEmitter{

    constructor (fadeCandyInterface) {
        super()

        this.__fci = fadeCandyInterface
        this.ready = false
    }

    static get events () {
        return events;
    }

    create (data) {
        if (!data) data = this.generateDefault()

        let packet = new ClutPacket()

        if (this.__fci)
            this.__fci.send(packet.create(data), ()=>this.__onCLUTtransfer())
    }

    generateDefault () {
        let lut = new Uint8Array(3 * 257 * 2)

        // for channel in range(3):
        for(let channel = 0; channel < 3; channel++) {

            //for row in range(257):
            for(let row = 0; row < 257; row++) {

                let value = Math.min(0xFFFF, Math.floor(Math.pow(row / 256, 2.2) * 0x10000))
                let i = channel * 257 + row

                lut[i*2] = value & 0xFF // entry high byte
                lut[i*2 + 1] = value >> 8 // entry low byte
            }
        }

        return lut
    }

    __onCLUTtransfer () {
        this.ready = true
        this.emit(events.READY)
    }

}

