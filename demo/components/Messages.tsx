import React, { useEffect, useRef, useState } from 'react'

import { useSocket } from '../contexts/SocketContext'

import { MessagePayload } from './payload'

export const Messages = () => {

    const { client } = useSocket()

    const scrollableItem = useRef<HTMLDivElement>(document.createElement('div'))

    const [messages, setMessages] = useState<MessagePayload[]>([])

    useEffect(() => {
        if (client) {
            client.onPayload('message', (message) => {
                setMessages([ ...messages, message ])
            })
        }
    }, [client, messages])

    useEffect(() => {
        setTimeout(() => {
            const element = scrollableItem.current;
            element.scrollTo(0, element.scrollHeight);
        }, 50)
    }, [scrollableItem.current.innerHTML])

    return (
        <div className="Messages">
            <div ref={ scrollableItem }>
                {
                    messages.map(payload => (
                        <div key={payload.id}><b>{payload.name}</b>: {payload.message}</div>
                    ))
                }
            </div>
        </div>
    )
}
