'use strict'

const assert = require('assert')
const FadeCandyPacket = require('../dist/lib/FadeCandyPacket')

suite('test FadeCandyPacket', function () {

    test('MAX_SIZE', function (done) {

        let fc = new FadeCandyPacket()

        assert.equal(fc.MAX_SIZE,64)
        assert.equal(FadeCandyPacket.MAX_SIZE,64)
        done()
    })

    suite('pad', function () {

        test('ignore packets with MAX_SIZE', function (done) {
                let fc = new FadeCandyPacket()

                let packet = new Uint8Array(64)
                packet.fill(0)
                let padded = fc.pad(packet)

                assert.equal(packet, padded)
                done()
        })

        test('pad packets with less than MAX_SIZE', function (done) {
                let fc = new FadeCandyPacket()

                let packet = new Uint8Array(48)
                packet.fill(0)
                let padded = fc.pad(packet)

                assert.notEqual(packet, padded)
                assert.equal(padded.length, 64)
                done()
        })
    })

    test('createPacketArray', function (done) {
            let fc = new FadeCandyPacket()

            fc.max_entries = 61

            let data = new Uint8Array(1234)
            data.fill(0)

            let packetArray = fc.createPacketArray(data)

            assert.equal(packetArray.length, 21)
            assert(packetArray[0] instanceof Uint8Array)

            done()
    })

    suite('addControlByte', function () {

        test('nth packet', function (done) {
            let fc = new FadeCandyPacket()

            fc.type = 32

            let packet
            let index
            let packetArray

            //fc.addControlByte(packet, index, packetArray)

            done()
        })

        test('last packet', function (done) {
            done()
        })
    })

    test('setControlBytes', function (done) {
        done()
    })

    test('createBuffer', function (done) {
        done()
    })

    test('concatTyped', function (done) {
        done()
    })

})