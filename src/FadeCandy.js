'use strict'

const EventEmitter = require('events');
const Configuration = require('./lib/Configuration')
const ColorLUT = require('./lib/ColorLUT')
const Pixels = require('./lib/Pixels')
const FadeCandyInterface = require('./lib/FadeCandyInterface')

const events = {
    READY: 'ready',
    COLOR_LUT_READY: 'clut_ready'
}

module.exports = class FadeCandy extends EventEmitter {

    constructor () {
        super()

        this.fci = new FadeCandyInterface()
        this.fci.on(FadeCandyInterface.events.READY, ()=>this.__onInterfaceReady())

        this.Pixels = Pixels
        this.ColorLUT = ColorLUT
        this.Configuration = Configuration
        this.FadeCandyInterface = FadeCandyInterface
    }

    static get events () {
        return events
    }

    __onInterfaceReady () {

        //console.log('__onInterfaceReady')

        this.pixel = new Pixels(this.fci)
        this.clut = new ColorLUT(this.fci)
        this.clut.on(ColorLUT.events.READY, ()=>this.emit(events.COLOR_LUT_READY))
        this.config = new Configuration({}, this.fci)

        this.emit(events.READY)
    }

    send (pixelData) {
        if (this.clut.ready) return this.pixel.send(pixelData)

        //console.log('clut not set')
    }

}





