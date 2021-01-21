import { io, Socket } from 'socket.io-client'

type Props = {
    uri: string;
    code?: string;
}

export const connect = ({ uri, code }: Props): Socket => {

    const socket = io(uri, {
        query: code && `code=${code}`
    })

    return socket;
}