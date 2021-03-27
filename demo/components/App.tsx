import React, { useEffect } from 'react'

import { useSocket } from '../contexts/SocketContext'

import { Form } from './Form'
import { GitHub } from './GitHub'
import { Messages } from './Messages'
import { Welcome } from './Welcome'

export const App = () => {

    const { client, connected } = useSocket()

    useEffect(() => {
        if (client) {

            client.onInitialize((code) => {
                location.hash = code;
            })

            client.onDisconnect((reason) => {
                console.log('disconnected', reason)
            })

            client.onUserConnect((user) => {
                console.log('user connect', user)
            })

            client.onUserDisconnect((user) => {
                console.log('user disconnect', user)
            })

        }
    }, [client])

    if (!connected) {
        return (
            <>
                <GitHub />
                <Welcome />
            </>
        )
    }

    return (
        <>
            <Messages />
            <Form />
        </>
    )
}