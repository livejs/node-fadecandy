'use strict'

const FadeCandy = require('./dist/FadeCandy')

let fc = new FadeCandy()

fc.on(FadeCandy.events.READY, function () {

    console.log('FadeCandy.events.READY')

    // see the config schema
    console.log(fc.Configuration.schema)

    // create default color look up table
    fc.clut.create()

    // set fadecandy led to manual mode
    fc.config.set(fc.Configuration.schema.LED_MODE, 1)

    // blink that led
    let state = false
    setInterval(() => {
        state = !state;
        fc.config.set(fc.Configuration.schema.LED_STATUS, +state)
    }, 100)
})

fc.on(FadeCandy.events.COLOR_LUT_READY, function () {
    console.log('FaceCandy says color lut ready')

    let frame = 0
    let pixels = 120
    setInterval(function () {

        let data = new Uint8Array(pixels * 3)

        for (let pixel = 0; pixel < pixels; pixel ++) {
            //if (frame % pixels == pixel) {
                let i = 3 * pixel

                data[i] = 255
                data[i + 1] = 0
                data[i + 2] = 255
            //}
        }
        fc.send(data)
        frame++

    }, 20)
})