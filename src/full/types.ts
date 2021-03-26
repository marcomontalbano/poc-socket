
export type ConnectData = {
    room: RoomRequest
}

/** Query parameters in "io" uri */
export type ConnectQuery = {
    /** JSON as a string of a ConnectData object  */
    data: string
}

/** Params needed to create a Room Request */
export type RoomRequest = {
    /** Room name. Tipically this is the name of the application. */
    name: string
    /** Optional code. If code is not provided, a new one will be generated. */
    code?: string
    /** Room rules */
    rules: RoomRules
}


export type RoomRules = {
    min: number
    max: number
}

export type ServerState = {
    rooms: Room[]
}

/** Options to create a Room Instance */
export type RoomOptions = {
    /** Room name. Tipically this is the name of the application. */
    name: string
    /** Mandatory unique code. */
    code: string
    /** Room rules */
    rules: RoomRules
}

/** A User */
export type User = {
    /** Unique UID */
    uid: string
    /** Creation time */
    timestamp: number
}

/** A Room */
export type Room = RoomOptions & {
    /** Unique identifier. This is a combination of `name` and `code` */
    id: string
    /** Creation time */
    timestamp: number
    /** List of users inside the Room */
    users: {
        [uid: string]: User
    }
}

export enum SOCKET_EVENT {
    Disconnect = 'disconnect',
    Initialize = 'initialize',
    Error = 'error',
    Payload = 'payload',

    UserConnect = 'user-connect',
    UserDisconnect = 'user-disconnect',
}

export type GenericPayload = {
    type: string
}

export type PayloadOptions = {

    /**
     * Include sender into the recipient list
     * 
     * @defaultValue `true`
     */
    includeSender?: boolean
}