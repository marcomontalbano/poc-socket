import { Server, Socket } from 'socket.io'
import * as http from 'http'
import { ConnectData, ConnectQuery, SOCKET_EVENT } from './types'
import { Rooms } from './socket-server/Rooms'

type ServerProps = {
    srv: number | http.Server;
    corsOrigin?: string[];
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

            if (!data) {
                throw new Error('"data" field is mandatory when creating a Client')
            }

            const {
                room: roomRequest,
                uid
            } = JSON.parse(data) as ConnectData

            if (!roomRequest) {
                throw new Error('A Room Request has not been sent')
            }

            if (!uid) {
                throw new Error('UID is not set')
            }

            const room = rooms.getOrCreate(roomRequest)

            room.addUser(uid)

            socket.join(room.id)

            socket.emit(SOCKET_EVENT.Initialize, room.code)

            socket.on(SOCKET_EVENT.Disconnect, () => {
                room.removeUser(uid)

                if (ioIsRoomEmpty(io, room.id)) {
                    rooms.delete(room.id);
                }
            })

            socket.on(SOCKET_EVENT.PayloadToAll, (payload) => {
                // send to all clients, include sender
                io.to(room.id).emit(SOCKET_EVENT.Payload, payload)
            })

            socket.on(SOCKET_EVENT.PayloadBroadcast, (payload) => {
                // send to all clients, except sender
                socket.broadcast.to(room.id).emit(SOCKET_EVENT.Payload, payload)
            })

        } catch (error) {
            socket.emit(SOCKET_EVENT.Error, error.toString())
            socket.disconnect()
        }
    })

    return io;
}
