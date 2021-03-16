import React, { useState } from 'react'

import { useSocket } from '../contexts/SocketContext';

import { Arrow } from './Arrow';

export const Welcome = () => {

    const io = useSocket()

    const [name, setName] = useState<string>(sessionStorage.getItem('name') || '');

    const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.currentTarget.value)
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (name) {
            io.connect({
                uri: process.env.SOCKET_SERVER || 'localhost:3000',
                data: {
                    username: name,
                    room: {
                        name: 'chat',
                        code: location.hash ? location.hash.replace(/^#/, '') : undefined,
                        rules: {
                            min: 1,
                            max: 2
                        }
                    }
                }
            })

            sessionStorage.setItem('name', name)
        }
    }

    return (
        <div className="Welcome">
            <form onSubmit={ handleSubmit }>
                <input type="text" onChange={ handleChangeName } value={ name } placeholder="Write your name" />
                <button><Arrow /></button>
            </form>
        </div>
    )
}
