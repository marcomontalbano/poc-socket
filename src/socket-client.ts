import { io, Socket } from 'socket.io-client'

export type ConnectProps = {
    uri: string;
    name: string;
    code?: string;
}

export const connect = ({ uri, code, name }: ConnectProps): Socket => {

    const query = [
        `name=${name}`,
        code && `code=${code}`
    ].filter((e) => e).join('&')

    const socket = io(uri, { query })

    return socket;
}