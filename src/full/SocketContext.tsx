import React, { createContext, useContext, useState } from 'react';

import { GenericPayload } from './types';
import { connect as connectClient, ClientProps, SocketClient } from './socket-client';

type Context<Payload extends GenericPayload> = {
    client?: SocketClient<Payload>
    error?: Error
    connect: (props: ClientProps) => void
}

export function createSocketContext<Payload extends GenericPayload>() {

    const OriginalSocketContext = createContext<Context<Payload>>({connect: () => {}});

    function SocketProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
        const [client, setClient] = useState<SocketClient<Payload>>();
        const [error, setError] = useState<Error>();

        const connect = (props: ClientProps) => {
            const socketClient = connectClient<Payload>(props)
            socketClient.onError((e: Error) => setError(e))
            socketClient.onInitialize(() => setError(undefined))
            setClient(socketClient)
        }

        return (
            <OriginalSocketContext.Provider value={{ client, error, connect }}>
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
