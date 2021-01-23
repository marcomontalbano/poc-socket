import { Server, Socket } from 'socket.io'
import { v4 } from 'uuid'
import * as http from 'http'

type Props = {
    srv: number | http.Server;
    corsOrigin?: string | string[];
}

type Query = {
    code?: string;
    name?: string;
}

const rooms = new Set();

const uuidv4 = (name?: string) => {
    let room: string;
    let code: string;
    
    do {
        code = v4();
        room = `${name}-${code}`;
    } while (rooms.has(room))

    return code;
}

export const connect = ({ srv, corsOrigin }: Props): Server => {

    const io = new Server(srv, {
        cors: { origin: corsOrigin }
    });

    io.on('connection', (socket: Socket) => {
        const { name, code = uuidv4(name) } = socket.handshake.query as Query

        if (typeof name !== 'string' || name === '') {
            socket.emit('initialize_error', '"name" is not defined.')
            socket.disconnect()
            return;
        }

        const room = `${name}-${code}`;

        rooms.add(room);

        socket.join(room)

        socket.emit('initialize', code)

        socket.on('disconnect', () => {
            if (io.sockets.adapter.rooms.get(room) === undefined) {
                rooms.delete(room);
            }
        })

        socket.on('payload', (payload) => {
            // send to all clients, include sender
            io.to(room).emit('payload', payload)

            // // send to all clients, except sender
            // socket.broadcast.to(room).emit('payload', payload)
        })
    })

    return io;
}
