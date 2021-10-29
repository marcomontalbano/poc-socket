import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useSocket } from '@realtime/sdk-react.js'

export const Form = () => {

    const { client } = useSocket()

    const [message, setMessage] = useState<string>('');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (message !== '') {
            client?.send({
                type: 'message',
                id: uuidv4(),
                message
            })
        }

        setMessage('');
    }

    return (
        <form className="Form" onSubmit={ handleSubmit }>
            <input
                onChange={ (event) => setMessage(event.currentTarget.value) }
                autoComplete="off"
                type="text"
                value={message}
                placeholder="Write a message"
                />
        </form>
    )
}
