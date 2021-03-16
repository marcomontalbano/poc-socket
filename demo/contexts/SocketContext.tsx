import React, { createContext, useContext, useState } from 'react';
import { Socket } from 'socket.io-client';

import { connect as connectClient, ClientProps } from '../../src/full/socket-client';

type Context = {
    socket?: Socket
    error?: Error
    connect: (props: ClientProps) => void
}

const OriginalSocketContext = createContext<Context>({connect: () => {}});

export const SocketProvider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
    const [socket, setSocket] = useState<Socket>();
    const [error, setError] = useState<Error>();

    const connect = (props: ClientProps) => {
        const client = connectClient(props)
        client.on('error', (e: Error) => setError(e))
        client.on('initialize', () => setError(undefined))
        setSocket(client)
    }

    return (
        <OriginalSocketContext.Provider value={{ socket, error, connect }}>
            { children }
        </OriginalSocketContext.Provider>
    )
}

export const useSocket = () => useContext(OriginalSocketContext);