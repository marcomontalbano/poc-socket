import { io, Socket } from 'socket.io-client'

type Props = {
    uri: string;
    name: string;
    code?: string;
}

export const connect = ({ uri, code, name }: Props): Socket => {

    const query = [
        `name=${name}`,
        code && `code=${code}`
    ].filter((e) => e).join('&')

    const socket = io(uri, { query })

    return socket;
}