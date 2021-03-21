import { io, Socket } from 'socket.io-client'
import { ConnectData, ConnectQuery, GenericPayload, PayloadOptions, SOCKET_EVENT } from './types';

export type ClientProps = {
    uri: string;
    data: ConnectData;
}

export interface SocketClient<P extends GenericPayload> extends SocketIoClient<P> {}

class SocketIoClient<P extends GenericPayload> {
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

    onDisconnect(callback: () => void) {
        this.socket.on(SOCKET_EVENT.Disconnect, callback)
    }

    onError(callback: (error: Error) => void) {
        this.socket.on(SOCKET_EVENT.Error, callback)
    }

    onPayload<Type extends P['type']>(type: Type, callback: (payload: Extract<P, { type: Type }>) => void) {
        this.socket.on(SOCKET_EVENT.Payload, (payload: Extract<P, { type: Type }>) => {
            if (payload.type === type) {
                callback(payload)
            }
        })
    }

    /**
     * Send a `payload`.
     *
     * @param payload - Payload
     * @param options - Options for sending a payload
     */
    send(payload: P, { includeSender = true }: PayloadOptions = {}) {
        this.socket.emit(SOCKET_EVENT.Payload, {
            payload,
            includeSender
        })
    }

    get active(): boolean {
        return this.socket.active
    }
}

export const connect = <P extends GenericPayload>(clientProps: ClientProps): SocketClient<P> => new SocketIoClient<P>(clientProps)
