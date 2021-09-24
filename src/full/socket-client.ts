import { io, Socket } from 'socket.io-client'
import { ConnectData, ConnectQuery, GenericPayload, PayloadExtra, SOCKET_EVENT, User } from './types';

export type ClientProps = {
    uri: string;
    data: ConnectData;
}

type DisconnectReason = 'io server disconnect' | 'io client disconnect' | 'ping timeout' | 'transport close' | 'transport error'

export interface SocketClient extends SocketIoClient {}

class SocketIoClient {
    private socket: Socket

    constructor({ uri, data }: ClientProps) {
        const query: ConnectQuery = { data: JSON.stringify(data) }
        this.socket = io(uri, { query })
    }

    onInitialize(callback: (code: string) => void) {
        this.socket.on(SOCKET_EVENT.Initialize, callback)
    }

    disconnect() {
        this.socket.disconnect()
    }

    onDisconnect(callback: (reason: DisconnectReason) => void) {
        this.socket.on(SOCKET_EVENT.Disconnect, callback)
    }

    onError(callback: (error: Error) => void) {
        this.socket.on(SOCKET_EVENT.Error, callback)
    }

    onUserConnect(callback: (user: User, myself: boolean) => void) {
        this.socket.on(SOCKET_EVENT.UserConnect, callback)
    }

    onUserDisconnect(callback: (user: User) => void) {
        this.socket.on(SOCKET_EVENT.UserDisconnect, callback)
    }

    onPayload(type: GenericPayload['type'], callback: (payload: any, extra: PayloadExtra) => void) {
        this.socket.on(SOCKET_EVENT.Payload, (payload: any, extra: PayloadExtra) => {
            if (payload.type === type) {
                callback(payload, extra)
            }
        })
    }

    /**
     * Send a `payload`.
     *
     * @param payload - Payload
     * @param options - Options for sending a payload
     */
    send(payload: GenericPayload) {
        this.socket.emit(SOCKET_EVENT.Payload, payload)
    }

    get active(): boolean {
        return this.socket.active
    }
}

export const connect = (clientProps: ClientProps): SocketClient => new SocketIoClient(clientProps)
