import React, { createContext, useContext, useState } from 'react';

import { connect as connectClient, ClientProps, SocketClient } from './socket-client';

type Context = {
    client?: SocketClient
    error?: Error
    connected: boolean
    connect: (props: ClientProps) => void
}

const OriginalSocketContext = createContext<Context>({ connect: () => {}, connected: false });

function SocketProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
    const [connected, setConnected] = useState<boolean>(false)
    const [client, setClient] = useState<SocketClient>()
    const [error, setError] = useState<Error>()

    const connect = (props: ClientProps) => {
        const socketClient = connectClient(props)
        socketClient.onError((e: Error) => setError(e))
        socketClient.onDisconnect(() => setConnected(false))
        socketClient.onInitialize(() => {
            setError(undefined)
            setConnected(true)
        })
        setClient(socketClient)
    }

    return (
        <OriginalSocketContext.Provider value={{ client, error, connect, connected }}>
            { children }
        </OriginalSocketContext.Provider>
    )
}

function useSocket() {
    return useContext(OriginalSocketContext);
}

export {
    SocketProvider,
    useSocket
}
