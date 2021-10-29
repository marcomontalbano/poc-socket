import { v4 } from 'uuid';
import { RoomRequest } from '@realtime/types';
import { Room } from './Room';

export class Rooms {
    private _rooms: Map<string, Room> = new Map()

    constructor() {
        
    }

    private generateCode({ name, rules }: RoomRequest): string {
        let code: string;
        let room: Room;
    
        do {
            code = v4();
            room = new Room({ name, code, rules })
        } while (this._rooms.has(room.id))
    
        return code;
    }

    get size(): number {
        return this._rooms.size
    }

    has(id: string): boolean {
        return this._rooms.has(id)
    }

    getOrCreate({ name, rules, code = this.generateCode({ name, rules }) }: RoomRequest): Room {
        const room = new Room({ name, code, rules })

        if (!name) {
            throw new Error('Room "name" is a mandatory field')
        }

        if (!rules?.min || !rules?.max) {
            throw new Error('Room "rules" is not properly set')
        }

        if (this._rooms.has(room.id)) {
            return this._rooms.get(room.id) as Room
        }

        this._rooms.set(room.id, room)
        return room
    }

    delete(id: string) {
        this._rooms.delete(id)
    }
}