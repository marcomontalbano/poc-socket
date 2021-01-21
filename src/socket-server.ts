import { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import * as http from 'http'

type Props = {
    srv: number | http.Server;
    corsOrigin?: string | string[];
}

type Query = {
    code?: string
}

export const connect = ({ srv, corsOrigin }: Props): Server => {

    const io = new Server(srv, {
        cors: { origin: corsOrigin }
    });

    io.on('connection', (socket: Socket) => {
        const { code = uuidv4() }: Query = socket.handshake.query

        socket.join(code)

        socket.emit('initialized', code)

        socket.on('disconnect', () => {})

        socket.on('message', (message: string) => {
            io.to(code).emit('message', message)
        })
    })

    return io;
}
