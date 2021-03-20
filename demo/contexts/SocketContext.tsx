import { Payload } from '../components/payload'
import { createSocketContext } from '../../src/full/SocketContext'

export const { SocketProvider, useSocket } = createSocketContext<Payload>()
