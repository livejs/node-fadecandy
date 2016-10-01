# tessel2-fadecandy

Library to control and send video frames to a FadeCandy from Tessel2 via USB

This project is in a realy early state, see `demo.js` for usage.


## Example

Load and init lib

```
const FadeCandy = require('tessel2-fadecandy')

let fc = new FadeCandy()
```

Wait while the lib finds and setups the USB interface

```
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

```

video frames are available after a CLUT is set

```
fc.on(FadeCandy.events.COLOR_LUT_READY, function () {
    console.log('FaceCandy says color lut ready')

	// do some reeeeally basic running light on 6 leds 
    let frame = 0
    setInterval(function () {

        let data = new Uint8Array(6 * 3)

        for (let pixel = 0; pixel < 6; pixel ++) {
            if (frame % 6 == pixel) {
                let i = 3 * pixel

                data[i] = 255
                data[i + 1] = 0
                data[i + 2] = 255
            }
        }
        fc.send(data)
        frame++

    }, 100)
})
```