import React, { useEffect, useRef, useState } from 'react'

import { useSocket } from '../contexts/SocketContext'

import { Payload } from './types'

export const Messages = () => {

    const io = useSocket()

    const scrollableItem = useRef()

    const [payloads, setPayloads] = useState<Payload[]>([])
    const [lastPayload, setLastPayload] = useState<Payload>()

    useEffect(() => {
        if (io.socket) {
            io.socket.on('payload', (payload: Payload) => {
                setLastPayload(payload)
            })
        }
    }, [io.socket])

    useEffect(() => {
        if (lastPayload) {
            setPayloads([ ...payloads, lastPayload ])
        }
    }, [lastPayload])

    useEffect(() => {
        setTimeout(() => {
            const element = scrollableItem.current as HTMLDivElement;
            element.scrollTo(0, element.scrollHeight);
        }, 50)
    }, [(scrollableItem.current as HTMLDivElement)?.innerHTML])

    return (
        <div className="Messages">
            <div ref={ scrollableItem }>
                { payloads.map(payload => (
                    <div key={payload.id}><b>{payload.name}</b>: {payload.message}</div>
                )) }
            </div>
        </div>
    )
}
