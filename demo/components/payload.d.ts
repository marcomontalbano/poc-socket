import { PayloadExtra } from '../../src/full/types'

export type MessagePayload = {
    type: 'message'
    id: string
    message: string
}

export type OtherPayload = {
    type: 'other'
    id: string
}

export type Payload = MessagePayload | OtherPayload

declare module '../../src/full/socket-client' {
    interface SocketClient {
        send(payload: Payload): void
        onPayload<Type extends Payload['type']>(type: Type, callback: (payload: Extract<Payload, { type: Type }>, extra: PayloadExtra) => void): void
    }
}

declare module '../../src/full/types' {
    interface UserData {
        username: string
    }
}