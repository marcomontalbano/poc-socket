import { io, Socket } from 'socket.io-client'
import { ConnectData, ConnectQuery } from './types';

export type ClientProps = {
    uri: string;
    data: ConnectData;
}

export const connect = ({ uri, data }: ClientProps): Socket => {

    const query: ConnectQuery = { data: JSON.stringify(data) }

    const socket = io(uri, { query })

    return socket;
}