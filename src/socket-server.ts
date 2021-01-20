import { Server, Socket } from 'socket.io'

const port = parseInt(process.env.PORT || '3000');

const io = new Server(port, {
    cors: {
        origin: 'http://localhost:1234'
    }
});

io.on('connection', (socket: Socket) => {
    const { code } = (socket.handshake.query as { code: string })

    socket.join(code)

    socket.on('disconnect', () => {})

    socket.on('message', (message: string) => {
        io.to(code).emit('message', message)
    })
})