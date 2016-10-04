'use strict'
const debug = require('debug')('USBInterface')
const VENDOR_ID = 7504;
const PRODUCT_ID = 24698;

const events = {
    READY: 'ready',
    DETACHED: 'fadecandy_detached'
}

const usb = require('usb')

const EventEmitter = require('events');

module.exports = class USBInterface extends EventEmitter {

    constructor () {
        super()

        usb.on('attach', (device) => this.__onDeviceAttach(device)); // doesn't really work :(
        usb.on('detach', (device) => this.__onDeviceDetach(device));

        process.nextTick(()=>this.connect())
    }

    static get events () {
        return events;
    }

    connect () {
        this.__getDevice()
    }

    send (data, cb) {
        this.endpoint.transfer(data, (err) => this.__onTransferComplete(err, cb))
    }

    __onDeviceAttach (device) {
        if (
            device.deviceDescriptor.idVendor == VENDOR_ID &&
            device.deviceDescriptor.idProduct == PRODUCT_ID
        ) {

            debug('__onDeviceAttach: device is ours')

            this.device = device;
            this.__init()
        }
    }

    __onDeviceDetach(device) {
        debug('__onDeviceDetach')
        if (
            device.deviceDescriptor.idVendor == VENDOR_ID &&
            device.deviceDescriptor.idProduct == PRODUCT_ID
        ) {
            this.emit(events.DETACHED)
        }
    }

    __onTransferComplete (err, cb) {
        if (err) {
            console.log('endpoint transfer error', err)
            this.emit(events.TRANSFERERROR, err)
            return
        }

        if (cb) cb()

        debug('transfer complete')
    }

    __init () {
        this.endpoint = this.__getEndpoint()

        debug('has endpoint')

        this.emit(events.READY, this.endpoint)
    }

    __getDevice () {
        this.device = usb.findByIds(VENDOR_ID, PRODUCT_ID)

        debug('has device: ' + !this.device)

        if (this.device) this.__init()
    }

    __getEndpoint () {
        this.configDescriptor = this.device.configDescriptor

        this.device.open()

        let fci = this.device.interface(0)

        fci.claim()

        return fci.endpoint(1)
    }

}