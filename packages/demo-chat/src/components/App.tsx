import React, { useEffect } from 'react'

import { useSocket } from '@realtime/sdk-react.js'

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

            client.onUserConnect((user, myself) => {
                console.log('user connect', myself, user)
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