import { Server } from 'socket.io'
import { io, Socket } from 'socket.io-client'
import * as http from 'http'
import * as uuid from 'uuid'

import { connect as connectServer } from './socket-server'
import { connect as connectClient } from './socket-client'

jest.mock('uuid');

const uuidv4 = uuid.v4 as jest.Mock;

let httpServer: http.Server
let server: Server

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

const promisifyOn = (client: Socket, event: string) => {
    return new Promise((resolve) => {
        client.on(event, resolve)
    })
}

describe('socket-server', () => {

    let client1: Socket
    let client2: Socket

    afterEach(() => {
        if (client1?.active) {
            client1.disconnect()
        }

        if (client2?.active) {
            client2.disconnect()
        }
    })

    describe('when clients have the same "code" and the same "name"', () => {

        beforeEach(() => {
            client1 = connectClient({
                uri: serverConfig.uri,
                data: {
                    room: {
                        code: '1234',
                        name: 'App1',
                        rules: {
                            min: 1,
                            max: 2
                        }
                    },
                    username: 'Marco'
                }
            });

            client2 = connectClient({
                uri: serverConfig.uri,
                data: {
                    room: {
                        code: '1234',
                        name: 'App2',
                        rules: {
                            min: 1,
                            max: 2
                        }
                    },
                    username: 'Marco'
                }
            });
        })

        it('should send an "initialize" event with the provided code', async () => {
            await expect(promisifyOn(client1, 'initialize')).resolves.toEqual('1234')
            await expect(promisifyOn(client2, 'initialize')).resolves.toEqual('1234')
        })

        // it('should forward incoming messages to both clients', async () => {
        //     client1.emit('payload', 'Hi there!');

        //     await expect(promisifyOn(client1, 'payload')).resolves.toEqual('Hi there!')
        //     await expect(promisifyOn(client2, 'payload')).resolves.toEqual('Hi there!')
        // })
    })

    describe('when clients have the same "code" but a different "name"', () => {

        beforeEach(() => {
            client1 = connectClient({
                uri: serverConfig.uri,
                data: {
                    room: {
                        code: '1234',
                        name: 'App1',
                        rules: {
                            min: 1,
                            max: 2
                        }
                    },
                    username: 'Marco'
                }
            });

            client2 = connectClient({
                uri: serverConfig.uri,
                data: {
                    room: {
                        code: '1234',
                        name: 'App2',
                        rules: {
                            min: 1,
                            max: 2
                        }
                    },
                    username: 'Marco'
                }
            });
        })

        it('should send an "initialize" event with the provided code', async () => {
            await expect(promisifyOn(client1, 'initialize')).resolves.toEqual('1234')
            await expect(promisifyOn(client2, 'initialize')).resolves.toEqual('1234')
        })

        it('should forward incoming messages to the right client', (done) => {
            client1.emit('payload', 'Hi there!');

            const onMessage1 = jest.fn();
            const onMessage2 = jest.fn();

            client1.on('payload', onMessage1);
            client2.on('payload', onMessage2);

            setTimeout(() => {
                expect(onMessage1).toBeCalledTimes(1)
                expect(onMessage1).toBeCalledWith('Hi there!')

                expect(onMessage2).toBeCalledTimes(0)

                done();
            }, 100)
        })
    })

    describe('when clients have a different "code" but the same "name', () => {

        beforeEach(() => {
            client1 = connectClient({
                uri: serverConfig.uri,
                data: {
                    room: {
                        code: '1234',
                        name: 'App1',
                        rules: {
                            min: 1,
                            max: 2
                        }
                    },
                    username: 'Marco'
                }
            });

            client2 = connectClient({
                uri: serverConfig.uri,
                data: {
                    room: {
                        code: 'ABCD',
                        name: 'App1',
                        rules: {
                            min: 1,
                            max: 2
                        }
                    },
                    username: 'Marco'
                }
            });
        })

        it('should send an "initialize" event with the provided code', async () => {
            await expect(promisifyOn(client1, 'initialize')).resolves.toEqual('1234')
            await expect(promisifyOn(client2, 'initialize')).resolves.toEqual('ABCD')
        })

        it('should forward incoming messages to the right client', (done) => {
            client1.emit('payload', 'Hi there!');

            const onMessage1 = jest.fn();
            const onMessage2 = jest.fn();

            client1.on('payload', onMessage1);
            client2.on('payload', onMessage2);

            setTimeout(() => {
                expect(onMessage1).toBeCalledTimes(1)
                expect(onMessage1).toBeCalledWith('Hi there!')

                expect(onMessage2).toBeCalledTimes(0)

                done();
            }, 100)
        })
    })

    describe(`when client doesn't have a "code"`, () => {

        beforeEach(() => {
            uuidv4.mockReset()

            client1 = connectClient({
                uri: serverConfig.uri,
                data: {
                    room: {
                        name: 'App1',
                        rules: {
                            min: 1,
                            max: 2
                        }
                    },
                    username: 'Marco'
                }
            });

            client2 = connectClient({
                uri: serverConfig.uri,
                data: {
                    room: {
                        name: 'App1',
                        rules: {
                            min: 1,
                            max: 2
                        }
                    },
                    username: 'Marco'
                }
            });
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

    it(`should throw an error when client doesn't have a query`, async () => {
        client1 = io(serverConfig.uri);

        await expect(promisifyOn(client1, 'error')).resolves.toContain('"data" field is mandatory when creating a Client')
    })

    it(`should throw an error when client is created without a Room Request`, async () => {
        client1 = io(serverConfig.uri, {
            query: {
                data: JSON.stringify({})
            }
        });

        await expect(promisifyOn(client1, 'error')).resolves.toContain('A Room Request has not been sent')
    })

    it(`should throw an error when client is created without a username`, async () => {
        client1 = io(serverConfig.uri, {
            query: {
                data: JSON.stringify({
                    room: {}
                })
            }
        });

        await expect(promisifyOn(client1, 'error')).resolves.toContain('Username is not set')
    })
})
