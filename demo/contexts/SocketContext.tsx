import React, { createContext, useContext, useState } from 'react';
import { Socket } from 'socket.io-client';

import { connect as connectClient, ConnectProps } from '../../src/simple/socket-client';

type Context = {
    socket?: Socket
    connect: (props: ConnectProps) => void
}

const OriginalSocketContext = createContext<Context>({connect: () => {}});

export const SocketProvider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
    const [socket, setSocket] = useState<Socket>();

    const connect = (props: ConnectProps) => {
        setSocket(connectClient(props))
    }

    return (
        <OriginalSocketContext.Provider value={{ socket, connect }}>
            { children }
        </OriginalSocketContext.Provider>
    )
}

export const useSocket = () => useContext(OriginalSocketContext);