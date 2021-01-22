import React, { useState } from 'react'

import { useSocket } from '../contexts/SocketContext';

export const Welcome = () => {

    const io = useSocket()

    const [name, setName] = useState<string>(localStorage.getItem('name') || '');

    const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.currentTarget.value)
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (name) {
            io.connect({
                uri: 'localhost:3000',
                name: 'chat',
                code: location.hash ? location.hash.replace(/^#/, '') : null
            })

            localStorage.setItem('name', name)
        }
    }

    return (
        <form onSubmit={ handleSubmit }>
            <input type="text" onChange={ handleChangeName } value={ name } placeholder="Name" />
        </form>
    )
}
