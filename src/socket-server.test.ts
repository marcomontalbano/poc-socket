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

const promisifyOn = (client: Socket, event: string) => {
    return new Promise((resolve) => {
        client.on(event, resolve)
    })
}

describe('socket-server', () => {
    describe('when clients have the same "code" and the same "name"', () => {

        let client1: Socket
        let client2: Socket

        beforeEach(() => {
            client1 = io(serverConfig.uri, {
                query: `code=1234&name=App1`
            });

            client2 = io(serverConfig.uri, {
                query: `code=1234&name=App1`
            });
        })

        afterEach(() => {
            client1.disconnect()
            client2.disconnect()
        })

        it('should send an "initialize" event with the provided code', async () => {
            await expect(promisifyOn(client1, 'initialize')).resolves.toEqual('1234')
            await expect(promisifyOn(client2, 'initialize')).resolves.toEqual('1234')
        })

        it('should forward incoming messages to both clients', async () => {
            client1.emit('message', 'Hi there!');

            await expect(promisifyOn(client1, 'message')).resolves.toEqual('Hi there!')
            await expect(promisifyOn(client2, 'message')).resolves.toEqual('Hi there!')
        })
    })

    describe('when clients have the same "code" but a different "name"', () => {

        let client1: Socket
        let client2: Socket

        beforeEach(() => {
            client1 = io(serverConfig.uri, {
                query: `code=1234&name=App1`
            });

            client2 = io(serverConfig.uri, {
                query: `code=1234&name=App2`
            });
        })

        afterEach(() => {
            client1.disconnect()
            client2.disconnect()
        })

        it('should send an "initialize" event with the provided code', async () => {
            await expect(promisifyOn(client1, 'initialize')).resolves.toEqual('1234')
            await expect(promisifyOn(client2, 'initialize')).resolves.toEqual('1234')
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

    describe('when clients have a different "code" but the same "name', () => {

        let client1: Socket
        let client2: Socket

        beforeEach(() => {
            client1 = io(serverConfig.uri, {
                query: `code=1234&name=App1`
            });

            client2 = io(serverConfig.uri, {
                query: `code=ABCD&name=App1`
            });
        })

        afterEach(() => {
            client1.disconnect()
            client2.disconnect()
        })

        it('should send an "initialize" event with the provided code', async () => {
            await expect(promisifyOn(client1, 'initialize')).resolves.toEqual('1234')
            await expect(promisifyOn(client2, 'initialize')).resolves.toEqual('ABCD')
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

        let client1: Socket
        let client2: Socket

        beforeEach(() => {
            uuidv4.mockReset()

            client1 = io(serverConfig.uri, {
                query: `name=App1`
            })

            client2 = io(serverConfig.uri, {
                query: `name=App1`
            })
        })

        afterEach(() => {
            client1.disconnect()
            client2.disconnect()
        })

        it('should send an "initialize" event with the generated code', async () => {
            uuidv4
                .mockReturnValueOnce('new-uuid1')
                .mockReturnValueOnce('new-uuid2')

            await expect(promisifyOn(client1, 'initialize')).resolves.toEqual('new-uuid1')
            await expect(promisifyOn(client2, 'initialize')).resolves.toEqual('new-uuid2')
        })

        it('should not generate the same code twice', async () => {
            uuidv4
                .mockReturnValueOnce('new-uuid1')
                .mockReturnValueOnce('new-uuid1')
                .mockReturnValueOnce('new-uuid1')
                .mockReturnValueOnce('new-uuid1')
                .mockReturnValueOnce('new-uuid2')

            await expect(promisifyOn(client1, 'initialize')).resolves.toEqual('new-uuid1')
            await expect(promisifyOn(client2, 'initialize')).resolves.toEqual('new-uuid2')
        })
    })

    describe(`when client doesn't have a "name"`, () => {

        let client: Socket

        beforeEach(() => {
            client = io(serverConfig.uri);
        })

        afterEach(() => {
            client.disconnect()
        })

        it('should throw an error', async () => {
            await expect(promisifyOn(client, 'initialize_error')).resolves.toEqual('"name" is not defined.')
        })
    })
})
