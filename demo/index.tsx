import React from 'react'
import { render } from 'react-dom'

import { SocketProvider } from './contexts/SocketContext'

import { App } from './components/App'

const Root = () => (
    <SocketProvider>
        <App />
    </SocketProvider>
)

render(<Root />, document.getElementById('root'))
