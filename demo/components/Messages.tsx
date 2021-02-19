import React, { useEffect, useRef, useState } from 'react'

import { useSocket } from '../contexts/SocketContext'

import { Payload } from './types'

export const Messages = () => {

    const io = useSocket()

    const scrollableItem = useRef<HTMLDivElement>(document.createElement('div'))

    const [payloads, setPayloads] = useState<Payload[]>([])
    // const [lastPayload, setLastPayload] = useState<Payload>()

    console.log('payloads from outside', payloads);

    useEffect(() => {
        if (io.socket) {
            io.socket.off('payload').on('payload', (payload: Payload) => {
                console.log('payloads from inside', payloads);
                // setLastPayload(payload)
                setPayloads([ ...payloads, payload ])
            })
        }
    }, [io.socket, payloads])

    // useEffect(() => {
    //     if (lastPayload) {
    //         setPayloads([ ...payloads, lastPayload ])
    //     }
    // }, [lastPayload])

    useEffect(() => {
        setTimeout(() => {
            const element = scrollableItem.current;
            element.scrollTo(0, element.scrollHeight);
        }, 50)
    }, [scrollableItem.current.innerHTML])

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
