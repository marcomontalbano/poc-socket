import React, { useEffect } from 'react'

import { useSocket } from '../contexts/SocketContext'

import { Form } from './Form'
import { GitHub } from './GitHub'
import { Messages } from './Messages'
import { Welcome } from './Welcome'

export const App = () => {

    const io = useSocket()

    useEffect(() => {
        if (io.socket) {

            io.socket.on('initialize', (code: string) => {
                location.hash = code;
            })

            io.socket.on('initialize_error', (message: string) => {
                console.log('error', message)
            })

            io.socket.on('disconnect', () => [
                console.log('disconnected')
            ])

        }
    }, [io.socket])

    if (!io.socket) {
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