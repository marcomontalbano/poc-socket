import { Server } from 'socket.io'
import * as http from 'http'
import * as uuid from 'uuid'

const { v4: generateRoomName } = jest.requireActual('uuid')

import waitForExpect from 'wait-for-expect'

import { connect as connectServer } from './socket-server'
import { connect as connectClient, SocketClient } from './socket-client'
import { io } from 'socket.io-client'

jest.mock('uuid');

const uuidv4 = uuid.v4 as jest.Mock;

let httpServer: http.Server
let server: Server

type Payload = {
    type: 'message'
    message: string
} | {
    type: 'greet',
    from: string
}

const serverConfig = (() => {
    const defaults = {
        address: '0.0.0.0',
        port: 8181
    }

    return {
        ...defaults,
        uri: `http://${defaults.address}:${defaults.port}`
    }
})()

function makeClient(name: string, code: string | undefined, username: string, [min, max]: [number, number]) {
    return connectClient<Payload>({
        uri: serverConfig.uri,
        data: {
            room: {
                name,
                code,
                rules: { min, max }
            },
            username
        }
    });
}

function makeConnectedClient(name: string, code: string | undefined, username: string, [min, max]: [number, number]): Promise<SocketClient<Payload>> {
    return new Promise((resolve, reject) => {
        const client = makeClient(name, code, username, [min, max])
        client.onInitialize(() => resolve(client))
        client.onError((error) => reject(error))
    })
}

beforeAll(() => {
    httpServer = http.createServer(() => console.log(' -/- '))

    server = connectServer({
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

describe('socket-server', () => {

    let client1: SocketClient<Payload>
    let client2: SocketClient<Payload>
    let client3: SocketClient<Payload>

    afterEach(() => {
        if (client1?.active) {
            client1.disconnect()
        }

        if (client2?.active) {
            client2.disconnect()
        }

        if (client3?.active) {
            client3.disconnect()
        }

        uuidv4.mockReset()
    })

    it('should send an "initialize" event with the provided code when a client connects', async () => {
        client1 = makeClient(generateRoomName(), '1234', 'Username', [1, 2])

        const callback = jest.fn()
        client1.onInitialize(callback)

        await waitForExpect(() => {
            expect(callback).toBeCalledTimes(1)
            expect(callback).toBeCalledWith('1234')
        })
    })

    it('should send an "initialize" event with a unique generated code when a clients connect without a code', async () => {
        uuidv4
            .mockReturnValueOnce('new-code1')
            .mockReturnValueOnce('new-code1')
            .mockReturnValueOnce('new-code1')
            .mockReturnValueOnce('new-code2')

        const roomName = generateRoomName()
        client1 = await makeClient(roomName, undefined, 'Username 1', [1, 2])
        client2 = await makeClient(roomName, undefined, 'Username 2', [1, 2])

        const onInitialize1 = jest.fn()
        client1.onInitialize(onInitialize1)

        const onInitialize2 = jest.fn()
        client2.onInitialize(onInitialize2)

        await waitForExpect(() => {
            expect(onInitialize1).toBeCalledTimes(1)
            expect(onInitialize1).toBeCalledWith('new-code1')

            expect(onInitialize2).toBeCalledTimes(1)
            expect(onInitialize2).toBeCalledWith('new-code2')
        })
    })

    it('should be able to disconnect a client', async () => {
        const roomName = generateRoomName();
        client1 = await makeConnectedClient(roomName, '1234', 'Username 1', [1, 2])
        client2 = await makeConnectedClient(roomName, '1234', 'Username 2', [1, 2])

        const onDisconnect1 = jest.fn();
        const onDisconnect2 = jest.fn();

        client1.onDisconnect(onDisconnect1);
        client2.onDisconnect(onDisconnect2);

        client1.disconnect();

        await waitForExpect(() => {
            expect(onDisconnect1).toBeCalledTimes(1)
            expect(onDisconnect1).toBeCalledWith('io client disconnect')

            expect(onDisconnect2).toBeCalledTimes(0)
        })
    })

    it('should forward incoming messages to clients on the same room with the same code that are listening the that payload type', async () => {
        const roomName = generateRoomName();
        client1 = await makeConnectedClient(roomName, '1234', 'Username 1', [1, 3])
        client2 = await makeConnectedClient(roomName, '1234', 'Username 2', [1, 3])
        client3 = await makeConnectedClient(roomName, '1234', 'Username 3', [1, 3])

        const onMessage1 = jest.fn();
        const onMessage2 = jest.fn();
        const onMessage3 = jest.fn();

        client1.onPayload('message', onMessage1);
        client2.onPayload('greet', onMessage2);
        client3.onPayload('message', onMessage3);

        client1.send({
            type: 'message',
            message: 'Hi there!'
        });

        await waitForExpect(() => {
            expect(onMessage1).toBeCalledTimes(1)
            expect(onMessage1).toBeCalledWith({
                type: 'message',
                message: 'Hi there!'
            })

            expect(onMessage2).toBeCalledTimes(0)

            expect(onMessage3).toBeCalledTimes(1)
            expect(onMessage3).toBeCalledWith({
                type: 'message',
                message: 'Hi there!'
            })
        })
    })

    it('should forward incoming messages to clients on the same room with the same code excluding the sender (option includeSender set to false)', async () => {
        const roomName = generateRoomName();
        client1 = await makeConnectedClient(roomName, '1234', 'Username 1', [1, 2])
        client2 = await makeConnectedClient(roomName, '1234', 'Username 2', [1, 2])

        const onMessage1 = jest.fn();
        const onMessage2 = jest.fn();

        client1.onPayload('message', onMessage1);
        client2.onPayload('message', onMessage2);

        client1.send({
            type: 'message',
            message: 'Hi there!'
        }, { includeSender: false });

        await waitForExpect(() => {
            expect(onMessage1).toBeCalledTimes(0)

            expect(onMessage2).toBeCalledTimes(1)
            expect(onMessage2).toBeCalledWith({
                type: 'message',
                message: 'Hi there!'
            })
        })
    })

    it('should NOT forward incoming messages to clients on the same room but with a different code', async () => {
        const roomName = generateRoomName();
        client1 = await makeConnectedClient(roomName, '1234', 'Username 1', [1, 2])
        client2 = await makeConnectedClient(roomName, 'ABCD', 'Username 2', [1, 2])

        const onMessage1 = jest.fn();
        const onMessage2 = jest.fn();

        client1.onPayload('message', onMessage1);
        client2.onPayload('message', onMessage2);

        client1.send({
            type: 'message',
            message: 'Hi there!'
        });

        await waitForExpect(() => {
            expect(onMessage1).toBeCalledTimes(1)
            expect(onMessage1).toBeCalledWith({
                type: 'message',
                message: 'Hi there!'
            })

            expect(onMessage2).toBeCalledTimes(0)
        })
    })

    it('should NOT forward incoming messages to clients on different room', async () => {
        client1 = await makeConnectedClient(generateRoomName(), '1234', 'Username 1', [1, 2])
        client2 = await makeConnectedClient(generateRoomName(), '1234', 'Username 2', [1, 2])

        const onMessage1 = jest.fn();
        const onMessage2 = jest.fn();

        client1.onPayload('message', onMessage1);
        client2.onPayload('message', onMessage2);

        client1.send({
            type: 'message',
            message: 'Hi there!'
        });

        await waitForExpect(() => {
            expect(onMessage1).toBeCalledTimes(1)
            expect(onMessage1).toBeCalledWith({
                type: 'message',
                message: 'Hi there!'
            })

            expect(onMessage2).toBeCalledTimes(0)
        })
    })

    describe('direct connection with "io"', () => {
        it(`should throw an error when client doesn't have a query`, async () => {
            const client = io(serverConfig.uri)
    
            const callback = jest.fn()
            client.on('error', callback)
    
            await waitForExpect(() => {
                expect(callback).toBeCalledTimes(1)
                expect(callback).toHaveBeenCalledWith('Error: "data" field is mandatory when creating a Client')
            })
        })

        it(`should throw an error when client is created without a Room Request`, async () => {
            const client = io(serverConfig.uri, {
                query: {
                    data: JSON.stringify({})
                }
            })
    
            const callback = jest.fn()
            client.on('error', callback)

            await waitForExpect(() => {
                expect(callback).toBeCalledTimes(1)
                expect(callback).toHaveBeenCalledWith('Error: A Room Request has not been sent')
            })
        })

        it(`should throw an error when client is created without a username`, async () => {
            const client = io(serverConfig.uri, {
                query: {
                    data: JSON.stringify({
                        room: {}
                    })
                }
            })
    
            const callback = jest.fn()
            client.on('error', callback)

            await waitForExpect(() => {
                expect(callback).toBeCalledTimes(1)
                expect(callback).toHaveBeenCalledWith('Error: Username is not set')
            })
        })
    })
})
