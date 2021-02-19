import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useSocket } from '../contexts/SocketContext'

import { Payload } from './types';

export const Form = () => {

    const io = useSocket()

    const [message, setMessage] = useState<string>('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (message !== '') {
            const payload: Payload = {
                id: uuidv4(),
                name: sessionStorage.getItem('name') || '',
                message
            }

            io.socket?.emit('payload', payload);
        }

        setMessage('');
    }

    const handleChangeMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.currentTarget.value)
    }

    return (
        <form className="Form" onSubmit={ handleSubmit }>
            <input onChange={ handleChangeMessage } autoComplete="off" type="text" value={message} placeholder="Write a message" />
        </form>
    )
}
