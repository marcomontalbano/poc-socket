import { UserData, Room as IRoom, RoomOptions, User } from '@realtime/types';

export class Room implements IRoom {
    private _name
    private _code
    private _rules
    private _timestamp
    private _users: Map<string, User> = new Map()

    constructor({ name, code, rules }: RoomOptions) {
        this._name = name
        this._code = code
        this._rules = rules
        this._timestamp = Date.now()
    }

    get id() {
        return `${this._name}-${this._code}`
    }

    get name() {
        return this._name
    }

    get code() {
        return this._code
    }

    get rules() {
        return this._rules
    }

    get timestamp() {
        return this._timestamp
    }

    get users() {
        return Object.fromEntries( Array.from( this._users ) )
    }

    isFull() {
        return this._users.size >= this.rules.max
    }

    isReady() {
        return this._users.size >= this.rules.min && this._users.size <= this.rules.max
    }

    removeUser(uid: string): boolean {
        return this._users.delete(uid)
    }

    addUser(uid: string, data: UserData): User {
        if (this.isFull()) {
            throw new Error('Room out of limits')
        }

        if (this._users.has(uid)) {
            throw new Error(`"${uid}" is already in use`)
        }

        const user: User = {
            uid,
            timestamp: Date.now(),
            data
        }

        this._users.set(uid, user)

        return user
    }
}