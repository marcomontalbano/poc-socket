import React, { useEffect } from 'react'

import { useSocket } from '../contexts/SocketContext'

import { Form } from './Form'
import { GitHub } from './GitHub'
import { Messages } from './Messages'
import { Welcome } from './Welcome'

export const App = () => {

    const { client, error } = useSocket()

    useEffect(() => {
        if (client) {

            client.onInitialize((code: string) => {
                location.hash = code;
            })

            client.onDisconnect(() => [
                console.log('disconnected')
            ])

        }
    }, [client])

    console.log(error)

    if (!client || error) {
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