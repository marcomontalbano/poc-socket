
export type ConnectData = {
    room: RoomRequest
    username: string
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
    /** Unique username. */
    username: string
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
        [username: string]: User
    }
}