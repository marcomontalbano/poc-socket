import React, { createContext, useContext, useState } from 'react';

import { GenericPayload } from './types';
import { connect as connectClient, ClientProps, SocketClient } from './socket-client';

type Context<Payload extends GenericPayload> = {
    client?: SocketClient<Payload>
    error?: Error
    connected: boolean
    connect: (props: ClientProps) => void
}

export function createSocketContext<Payload extends GenericPayload>() {

    const OriginalSocketContext = createContext<Context<Payload>>({ connect: () => {}, connected: false });

    function SocketProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
        const [connected, setConnected] = useState<boolean>(false)
        const [client, setClient] = useState<SocketClient<Payload>>()
        const [error, setError] = useState<Error>()

        const connect = (props: ClientProps) => {
            const socketClient = connectClient<Payload>(props)
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

    return {
        SocketProvider,
        useSocket
    }
}
