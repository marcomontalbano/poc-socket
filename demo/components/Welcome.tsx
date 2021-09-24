import React, { useEffect, useState } from 'react'

import { useSocket } from '../../src/full/SocketContext';

import { Arrow } from './Arrow';

export const Welcome = () => {

    const io = useSocket()

    const [name, setName] = useState<string>('');
    const [roomMin, setRoomMin] = useState<number>(1);
    const [roomMax, setRoomMax] = useState<number>(10);

    const code = location.hash ? location.hash.replace(/^#/, '') : undefined

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (name) {
            io.connect({
                uri: process.env.SOCKET_SERVER || 'localhost:3000',
                data: {
                    room: {
                        name: 'chat',
                        code,
                        rules: {
                            min: roomMin,
                            max: roomMax
                        }
                    },
                    data: {
                        username: name
                    }
                }
            })
        }
    }

    return (
        <div className="Welcome">
            <form onSubmit={ handleSubmit }>
                <div className="name">
                    <input type="text" onChange={ (event) => setName(event.currentTarget.value) } value={ name } placeholder="Write your name" />
                    <button><Arrow /></button>
                </div>

                { io.error && <div className="error">{ io.error }</div> }

                {
                    !code && (
                        <fieldset className="room">
                            <legend>room settings</legend>
                            <p>Min users: <input type="number" min="1" value={ roomMin } onChange={ (event) => setRoomMin(parseInt(event.currentTarget.value)) } /></p>
                            <p>Max users: <input type="number" min="1" value={ roomMax } onChange={ (event) => setRoomMax(parseInt(event.currentTarget.value)) } /></p>
                        </fieldset>
                    )
                }
            </form>
        </div>
    )
}
