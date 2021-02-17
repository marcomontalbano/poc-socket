import { io, Socket } from 'socket.io-client'

export type ConnectProps = {
    uri: string;
    name: string;
    code?: string;
}

const removeEmpty = (obj) => {
    for (var propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined) {
            delete obj[propName];
        }
    }

    return obj
}

export const connect = ({ uri, code, name }: ConnectProps): Socket => {

    const query = removeEmpty({ name, code })

    const socket = io(uri, { query })

    return socket;
}