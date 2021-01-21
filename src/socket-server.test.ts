import { Server } from 'socket.io'
import { io, Socket } from 'socket.io-client'
import * as http from 'http'
import * as uuid from 'uuid'

import { connect } from './socket-server'

jest.mock('uuid');

const uuidv4 = uuid.v4 as jest.Mock;

let httpServer: http.Server
let server: Server

const serverConfig = (() => {
    const defaults = {
        address: '0.0.0.0',
        port: 8080
    }

    return {
        ...defaults,
        uri: `http://${defaults.address}:${defaults.port}`
    }
})()

beforeAll(() => {
    httpServer = http.createServer(() => console.log(' -/- '))

    server = connect({
        srv: httpServer
    })

    httpServer.listen(serverConfig.port, serverConfig.address)
});

afterAll((done) => {
    httpServer.close(() => {
        server.close(() => {
            done();
        });
    });
});

const promisifyOn = (client, event) => {
    return new Promise((resolve) => {
        client.on(event, resolve)
    })
}

describe('socket-server', () => {
    describe('when clients have the same "code"', () => {

        let client1: Socket
        let client2: Socket

        beforeEach(() => {
            client1 = io(serverConfig.uri, {
                query: `code=1234`
            });

            client2 = io(serverConfig.uri, {
                query: `code=1234`
            });
        })

        afterEach(() => {
            client1.disconnect()
            client2.disconnect()
        })

        it('should send an "initialized" event with the provided code', async () => {
            await expect(promisifyOn(client1, 'initialized')).resolves.toEqual('1234')
            await expect(promisifyOn(client2, 'initialized')).resolves.toEqual('1234')
        })

        it('should forward incoming messages to both clients', async () => {
            client1.emit('message', 'Hi there!');

            await expect(promisifyOn(client1, 'message')).resolves.toEqual('Hi there!')
            await expect(promisifyOn(client2, 'message')).resolves.toEqual('Hi there!')
        })
    })

    describe('when clients have different "code"', () => {

        let client1: Socket
        let client2: Socket

        beforeEach(() => {
            client1 = io(serverConfig.uri, {
                query: `code=1234`
            });

            client2 = io(serverConfig.uri, {
                query: `code=ABCD`
            });
        })

        afterEach(() => {
            client1.disconnect()
            client2.disconnect()
        })

        it('should send an "initialized" event with the provided code', async () => {
            await expect(promisifyOn(client1, 'initialized')).resolves.toEqual('1234')
            await expect(promisifyOn(client2, 'initialized')).resolves.toEqual('ABCD')
        })

        it('should forward incoming messages to the right client', (done) => {
            client1.emit('message', 'Hi there!');

            const onMessage1 = jest.fn();
            const onMessage2 = jest.fn();

            client1.on('message', onMessage1);
            client2.on('message', onMessage2);

            setTimeout(() => {
                expect(onMessage1).toBeCalledTimes(1)
                expect(onMessage1).toBeCalledWith('Hi there!')

                expect(onMessage2).toBeCalledTimes(0)

                done();
            }, 100)
        })
    })

    describe(`when client doesn't have a "code"`, () => {

        let client: Socket

        beforeEach(() => {
            uuidv4.mockReset()
            client = io(serverConfig.uri);
        })

        afterEach(() => {
            client.disconnect()
        })

        it('should send an "initialized" event with the generated code', async () => {
            uuidv4.mockReturnValue('new-uuid');
            await expect(promisifyOn(client, 'initialized')).resolves.toEqual('new-uuid')
        })
    })
})
