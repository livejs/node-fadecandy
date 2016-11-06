# node-fadecandy

Node library to control and send video frames directly to a FadeCandy device from NodeJS, via USB.

**It does not require the fcserver from FadeCandy**, this module communicates directly with the FadeCandy board via USB.

I suggest to go and check out what FadeCandy can do for your project.

TL;DR: it's a LED driver control board, having 8 output ports (GND and Signal). Each port can address 64 pixels, so a single FadeCandy board can drive 512 LEDs. To handle more, you'll need more FadeCandy boards, and [this issue to be resolved](https://github.com/necccc/tessel2-fadecandy/issues/1), since in the current state of this lib only supports a single FadeCandy device.

So 64 leds per port, you have to wire your leds according these ports, but not to worry about addressing them, because the FadeCandy device automatically splits the incoming data according to these ports. For example if you have 64 leds on the first, and 50 on the second one, you can send in a data for 114 pixels, and the FadeCandy will sort it out.

You have to provide the 5V power source for the neopixels, or, if you're like me, and use a few leds (in my case: 114), you can power the led strips directly from the FadeCandy hackerport's 3.3V output.

## Requirements

- If you wish to use this on a [Tessel 2 board](https://tessel.io/), update to it's firmware at least **0.0.16** (from that version it supports the [node-usb lib](https://github.com/tessel/node-usb) correctly) 
- A [FadeCandy controller](https://www.adafruit.com/product/1689), which is a NeoPixel driver that is connected via USB

**Note:** this lib is also usable from the desktop with the FadeCandy controller

This project is in a realy early state, see `demo.js` for usage [below](#Example). 


## Documentation

### class FadeCandy

FadeCandy is an instance of EventEmitter

```
const FadeCandy = require('tessel2-fadecandy')

const fc = new FadeCandy()
```


#### Events

##### FadeCandy.events.READY

The USB device is ready to use, you can set the color LUT or configure the controller

```
fc.on(FadeCandy.events.READY, function (fc) {

	// the USB device is ready!
	
})
```

##### FadeCandy.events.COLOR_LUT_READY

Color look-up table is set, ready to accept video frames

```
fc.on(FadeCandy.events.COLOR_LUT_READY, function (fc) {

	// we have a CLUT, lets blink!
	
})
```

#### Properties

##### fc.config

Instance of [FadeCandy.Configuration](#fadecandyconfiguration). Set or get the configuration values using this object. See the [FadeCandy.Configuration](#fadecandyconfiguration) class for more information.

##### fc.clut

Instance of [FadeCandy.ColorLUT](#fadecandycolorlut). You can send in a custom Color Look-Up Table, or use a default one. Check out the [FadeCandy.ColorLUT](#fadecandycolorlut) class for more information.


##### fc.usb

Instance of [FadeCandy.USBInterface](#fadecandyusbinterface). Device information and usb events are available through this object.


#### Methods

##### fc.send(data [, callback])

* `data` {UInt8Array} typed array containing RGB values for every pixel
* `callback` {Function} optional callback, which is fired on successful data transfer

Send video frame data. Every controlled pixel need 3 values of color channels: R,G,B. The bytearray in `data` contains these simply concatenated, like this:

```
// | 1st pixel  | 2nd pixel  | 3rd pixel
[    255, 0, 0,   0, 255, 0,   0, 0, 255  .... ] 
// first 3 pixels are a full red, a full green, and a full blue
```
**Note:** This method works only after a CLUT has been set




All the following classes are available as static properties on the FaceCandy class, or the instantiated object.

---

### FadeCandy.Configuration

Configure the FadeCandy controller through this class. 

Detailed information of the configuration packet [can be found here.](https://github.com/scanlime/fadecandy/blob/master/doc/fc_protocol_usb.md#configuration-packet)


#### Properties

##### FadeCandy.Configuration.schema

Contains the configuration schema that can be used


Configuration key				| Default value
-----------------				| -------------
MODE 							| 0
LED_STATUS 						| 0 
LED_MODE 						| 0 
DISABLE_KEYFRAME_INTERPOLATION | 0
DISABLE_DITHERING 				| 0 


#### Methods

##### fc.config.set(key, value)
##### fc.config.set(obj)

 * `key` {String}
 * `value` {Boolean}

Set a configuration value, or set multiple values. To set multiple values, pass in an object with the keys from the schema and their values.


```
// set a single value
fc.config.set(FadeCandy.Configuration.schema.DISABLE_KEYFRAME_INTERPOLATION, 1)

// set multiple values
fc.config.set({
	[FadeCandy.Configuration.schema.LED_MODE]: 1,
	[FadeCandy.Configuration.schema.LED_STATUS]: 1
})

```

##### fc.config.get([key])

 * `key` {String}

Get a configuration value, or get the whole currently set configuration.

```
// get the interpolation setting
let i = fc.config.get(FadeCandy.Configuration.schema.DISABLE_KEYFRAME_INTERPOLATION)

```

---

### FadeCandy.ColorLUT

FadeCandy.ColorLUT is an instance of EventEmitter. This class sets and/or generates a default Color Look-Up Table. As the [original FadeCandy docs](https://github.com/scanlime/fadecandy/blob/master/doc/fc_protocol_usb.md#color-lut-packets) describe:

> The look-up table is structured as three arrays of 257 entries, starting with the entire red-channel LUT, then the green-channel LUT, then the blue-channel LUT.

FadeCandy uses 16-bit color LUT entries, so for a bytearray or UInt8Array, these will be split into high and low bytes. The FadeCandy.ColorLUT accepts these data in one UInt8Array containing (3 channels * 256 entries * 2) bytes.


#### Events

##### FadeCandy.ColorLUT.events.READY

Fired when the last color LUT data packet was sent succesfully.

#### Methods

##### fc.clut.create([data]) 

 * `data` {Uint8Array} optional bytearray containing a color LUT

Set up a new Color LUT from the provided data. Data is optional, if not set, a default CLUT will be generated and used.


```
fc.on(FadeCandy.events.READY, function (fc) {

	// the USB device is ready!
	
	// set up the CLUT
	fc.clut.create() 
	
})
```

##### fc.clut.generateDefault()

Returns a Uint8Array, containing the default color look-up table. The code, that generates this default color LUT is based on [this simple example in Python for FadeCandy](https://github.com/scanlime/fadecandy/blob/master/examples/python/usb-lowlevel.py)


```
	// check out the CLUT before even using the FadeCandy lib

	let fclut = new FadeCandy.ColorLUT()

	let defaultCLUT = fclut.generateDefault() // UInt8Array

```


---

### FadeCandy.USBInterface

FadeCandy.USBInterface is an instance of EventEmitter. This class does the USB device discovery, opening the device, and claiming the interface. 

This process is supposed to be an underlying mechanism, so you don't have to meddle with USB connections.

#### Events

##### FadeCandy.USBInterface.READY

Emitted when the USB device is opened, and the interface is claimed, so basically it's ready to transfer data.

##### FadeCandy.USBInterface.DETACHED

Emitted if the FadeCancy device is detached from the host.

##### FadeCandy.USBInterface.TRANSFERERROR

Emitted, when a packet transfer results in error.

#### Properties

##### fc.usb.device

The USB device seen through the `node-usb` module. For example, you can find the deviceDescriptor and configDescriptor data here if needed.

##### fc.usb.endpoint

The OUT endpoint on which we communicate with the FadeCandy device.

#### Methods

##### fc.usb.connect()

Tries to connect to a FadeCandy device by it's vendor and product id.

##### fc.usb.send(data [,callback])

Sends data through the endpoint, handles callback, or emits TRANSFERERROR


---

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

    // create default color look-up table
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

## License

MIT License

Copyright (c) 2016 Szabolcs Szabolcsi-Toth

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
