import React, { useEffect, useState } from 'react'

import { useSocket } from '../contexts/SocketContext'

export const Messages = () => {

    const io = useSocket()

    const [payloads, setPayloads] = useState<Payload[]>([])
    const [lastPayload, setLastPayload] = useState<Payload>()

    useEffect(() => {
        if (io.socket) {
            io.socket.on('message', (payload: Payload) => {
                setLastPayload(payload)
            })
        }
    }, [io.socket])

    useEffect(() => {
        if (lastPayload) {
            setPayloads([ ...payloads, lastPayload ])
        }
    }, [lastPayload])

    return (
        <div className="Messages">
            { payloads.map(payload => <div><b>{payload.name}</b>: {payload.message}</div>) }
        </div>
    )
}
