import React, { useState } from 'react'

import { useSocket } from '../contexts/SocketContext'

export const Form = () => {

    const io = useSocket()

    const [message, setMessage] = useState<string>('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (message !== '') {
            const payload: Payload = {
                name: localStorage.getItem('name'),
                message
            }

            io.socket.emit('message', payload);
        }

        setMessage('');
    }

    const handleChangeMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.currentTarget.value)
    }

    return (
        <form className="Form" onSubmit={ handleSubmit }>
            <input onChange={ handleChangeMessage } autoComplete="off" type="text" value={message} placeholder="Type you message" />
        </form>
    )
}
