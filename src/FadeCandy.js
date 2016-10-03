'use strict'

const EventEmitter = require('events');
const Configuration = require('./lib/Configuration')
const ColorLUT = require('./lib/ColorLUT')
const Pixels = require('./lib/Pixels')
const USBInterface = require('./lib/USBInterface')

const events = {
    READY: 'ready',
    COLOR_LUT_READY: 'clut_ready'
}

module.exports = class FadeCandy extends EventEmitter {

    constructor () {
        super()

        this.usb = new USBInterface()
        this.usb.on(USBInterface.events.READY, ()=>this.__onInterfaceReady())

        this.Pixels = Pixels
        this.ColorLUT = ColorLUT
        this.Configuration = Configuration
        this.USBInterface = USBInterface
    }

    static get events () {
        return events
    }

    static get Pixels () {
        return Pixels
    }

    static get ColorLUT () {
        return ColorLUT
    }

    static get Configuration () {
        return Configuration
    }

    static get USBInterface () {
        return USBInterface
    }

    __onInterfaceReady () {

        //console.log('__onInterfaceReady')

        this.pixel = new Pixels(this.usb)
        this.clut = new ColorLUT(this.usb)
        this.clut.on(ColorLUT.events.READY, ()=>this.emit(events.COLOR_LUT_READY, this))
        this.config = new Configuration({}, this.usb)

        this.emit(events.READY, this)
    }

    send (pixelData) {
        if (this.clut.ready) return this.pixel.send(pixelData)

        //console.log('clut not set')
    }

}





