import { Server, Socket } from 'socket.io'
import * as http from 'http'
import crypto from 'crypto'

import { ConnectData, ConnectQuery, GenericPayload, SOCKET_EVENT } from './types'
import { Rooms } from './socket-server/Rooms'

type ServerProps = {
    srv: number | http.Server;
    corsOrigin?: string[];
}

type OnPayloadOptions = {
    payload: GenericPayload
}

function ioIsRoomEmpty(io: Server, roomId: string) {
    return io.sockets.adapter.rooms.get(roomId) === undefined
}

const rooms = new Rooms()

export const connect = ({ srv, corsOrigin }: ServerProps): Server => {

    const io = new Server(srv, {
        cors: { origin: corsOrigin }
    });

    io.on('connection', (socket: Socket) => {
        try {
            const { data } = socket.handshake.query as ConnectQuery

            // const {
            //     'x-forwarded-for': xForwardedFor,
            //     'x-forwarded-port': xForwardedPort,
            // } = socket.handshake.headers

            // console.info(`[${xForwardedFor}:${xForwardedPort}] CONNECT`);

            if (!data) {
                throw new Error('"data" field is mandatory when creating a Client')
            }

            const { room: roomRequest, data: userData } = JSON.parse(data) as ConnectData

            if (!roomRequest) {
                throw new Error('A Room Request has not been sent')
            }

            const uid = crypto.createHash('md5').update(socket.id).digest('hex')

            const room = rooms.getOrCreate(roomRequest)

            const user = room.addUser(uid, userData)

            socket.join(room.id)

            socket.emit(SOCKET_EVENT.Initialize, room.code, user)

            socket.broadcast.to(room.id).emit(SOCKET_EVENT.UserConnect, user, false)
            socket.emit(SOCKET_EVENT.UserConnect, user, true)

            socket.on(SOCKET_EVENT.Disconnect, () => {
                socket.broadcast.to(room.id).emit(SOCKET_EVENT.UserDisconnect, user)

                room.removeUser(uid)

                if (ioIsRoomEmpty(io, room.id)) {
                    rooms.delete(room.id);
                }
            })

            socket.on(SOCKET_EVENT.Payload, (payload) => {
                socket.broadcast.to(room.id).emit(SOCKET_EVENT.Payload, payload, { user, myself: false })
                socket.emit(SOCKET_EVENT.Payload, payload, { user, myself: true })
            })

            // socket.on(SOCKET_EVENT.Payload, ({ payload, includeSender }: OnPayloadOptions) => {
            //     if (includeSender) {
            //         // send to all clients, include sender
            //         io.to(room.id).emit(SOCKET_EVENT.Payload, payload)
            //     } else {
            //         // send to all clients, except sender
            //         socket.broadcast.to(room.id).emit(SOCKET_EVENT.Payload, payload)
            //     }
            // })

        } catch (_e) {
            const error = _e as Error
            socket.emit(SOCKET_EVENT.Error, error.toString())
            socket.disconnect()
        }
    })

    return io;
}
