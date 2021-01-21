import { Server, Socket } from 'socket.io'

const port = parseInt(process.env.PORT || '3000');

const origin = [
    'http://localhost:1234'
];

const io = new Server(port, {
    cors: { origin }
});

type Query = {
    code?: string
}

io.on('connection', (socket: Socket) => {
    const { code }: Query = socket.handshake.query

    socket.join(code)

    socket.emit('initialized', code)

    socket.on('disconnect', () => {})

    socket.on('message', (message: string) => {
        io.to(code).emit('message', message)
    })
})