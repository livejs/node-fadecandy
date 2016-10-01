'use strict'

const types = {
    VIDEO_FRAME: 0b00000000,
    CLUT: 0b01000000,
    CONFIGURATION: 0b10000000
}

const MAX_SIZE = 64

/*

set ctrl byte
    typecode
        0 videoframe (indexrange 0-24) (1 packet contains 21 pixels)
        1 CLUT (indexrange 0-24) (1 packet contains 31 16-bit lookup table entries)
        2 configuration

    final bit / by data
    packet index / by data

data must be single or multiple 64 byte packets



entries     // 63 for pixels (r + g + b)
            // 62 for LUT entries (high + low)
            // 1 for config


 */

module.exports = class FadeCandyPacket {

    constructor () {}

    static get types () {
        return types
    }

    static get max_size () {
        return MAX_SIZE
    }

    pad (packet) {
        if (packet.length < MAX_SIZE) {
            packet = this.concatTyped(Uint8Array, packet, new Uint8Array(MAX_SIZE - packet.length))
        }
        return packet
    }

    createPacketArray (data) {
        let packetArray = [];
        let iterateCount = Math.ceil(data.length / this.max_entries)
        //console.log('createPacketArray')
        //console.log('data.length', data.length)
        for (let i = 0 ; i < iterateCount ; i++) {

            //console.log('slice from', i * this.max_entries, 'until', i * this.max_entries + this.max_entries + 1)
            packetArray.push(data.slice(i * this.max_entries, i * this.max_entries + this.max_entries))
        }

        return packetArray;
    }

    setControlBytes (packetArray) {
        return packetArray.map((...arg) => this.addControlByte.apply(this, arg))
    }


    addControlByte (packet, index, packetArray) {
        let ctrlByte = new Uint8Array(1)
        let final = index + 1 === packetArray.length

        ctrlByte[0] |= this.type

        ctrlByte[0] |= index

        if (final) {
            ctrlByte[0] |= 32
        }

        packet = this.concatTyped(Uint8Array, ctrlByte, packet)

        return packet
    }

    createBuffer (packetArray) {
        packetArray = packetArray.map((packet) => this.pad(packet))

        return Buffer.concat(packetArray.map((packet) => Buffer.from(packet)))
    }

    concatTyped (resultConstructor, ...arrays) {
        let totalLength = 0;
        for (let arr of arrays) {
            totalLength += arr.length;
        }
        let result = new resultConstructor(totalLength);
        let offset = 0;
        for (let arr of arrays) {
            result.set(arr, offset);
            offset += arr.length;
        }
        return result;
    }
}