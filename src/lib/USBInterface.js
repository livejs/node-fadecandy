'use strict'

const VENDOR_ID = 7504;
const PRODUCT_ID = 24698;

const events = {
    READY: 'ready'
}

const usb = require('usb')

const EventEmitter = require('events');

module.exports = class USBInterface extends EventEmitter {

    constructor () {
        super()

        usb.on('attach', (device) => this.__onDeviceAttach(device));
        usb.on('detach', (device) => this.__onDeviceDetach(device));

        process.nextTick(()=>this.connect())
    }

    static get events () {
        return events;
    }

    connect () {
        this.__getDevice()
    }

    __onDeviceAttach (device) {
        if (
            device.deviceDescriptor.idVendor == VENDOR_ID &&
            device.deviceDescriptor.idProduct == PRODUCT_ID
        ) {
           // console.log('__onDeviceAttach', 'device is ours')

            this.device = device;
            this.__init()
        }
    }

    __onDeviceDetach(device) {
        //console.log('__onDeviceDetach')
    }

    __onTransferComplete (err, cb) {
        if (err) console.log('endpoint transfer error', err)

        if (cb) cb()

        //console.log('transfer complete')
    }

    __init () {
        this.endpoint = this.__getEndpoint()

       // console.log('__init', 'has endpoint')

        this.emit(events.READY, this.endpoint)
    }

    __getDevice () {
        this.device = usb.findByIds(VENDOR_ID, PRODUCT_ID)

       // console.log('__getDevice', !!this.device)

        if (this.device) this.__init()
    }

    __getEndpoint () {
        this.configDescriptor = this.device.configDescriptor

        this.device.open()

        let fci = this.device.interface(0)

        fci.claim()

        return fci.endpoint(1)
    }

    send (data, cb) {
        this.endpoint.transfer(data, (err) => this.__onTransferComplete(err, cb))
    }

}