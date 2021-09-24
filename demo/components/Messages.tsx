import React, { useEffect, useRef, useState } from 'react'

import { useSocket } from '../../src/full/SocketContext'
import { PayloadExtra } from '../../src/full/types'

import { MessagePayload } from './payload'

type Message = {
    payload: MessagePayload
    extra: PayloadExtra
}

export const Messages = () => {

    const { client } = useSocket()

    const scrollableItem = useRef<HTMLDivElement>(document.createElement('div'))

    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        if (client) {
            client.onPayload('message', (payload, extra) => {
                setMessages([ ...messages, { payload, extra } ])
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
                    messages.map(({ payload, extra }) => (
                        <div key={payload.id}><b>{extra.user.data.username}&nbsp;{extra.myself ? (<small>(me)</small>) : ''}</b>: {payload.message}</div>
                    ))
                }
            </div>
        </div>
    )
}
