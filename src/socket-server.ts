import { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import * as http from 'http'

type Props = {
    srv: number | http.Server;
    corsOrigin?: string | string[];
}

type Query = {
    code?: string;
    name?: string;
}

export const connect = ({ srv, corsOrigin }: Props): Server => {

    const io = new Server(srv, {
        cors: { origin: corsOrigin }
    });

    io.on('connection', (socket: Socket) => {
        const { name, code = uuidv4() } = socket.handshake.query as Query

        if (typeof name !== 'string' || name === '') {
            socket.emit('initialize_error', '"name" is not defined.')
            socket.disconnect()
            return;
        }

        const room = `${name}-${code}`;

        socket.join(room)

        socket.emit('initialize', code)

        socket.on('disconnect', () => {})

        socket.on('message', (message: string) => {
            io.to(room).emit('message', message)
        })
    })

    return io;
}
