import * as uuid from 'uuid'
import { RoomRequest } from '@realtime/types'

import { Rooms } from './Rooms'

jest.mock('uuid');

const uuidv4 = uuid.v4 as jest.Mock;

describe('Rooms', () => {

    beforeEach(() => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1615447648806)
        uuidv4.mockReset()
    })

    afterEach(() => {
        jest.spyOn(Date, 'now').mockRestore()
    })

    it('should throw an error when RoomRequest does not have a name', () => {
        const rooms = new Rooms()
        let roomRequest: RoomRequest = JSON.parse('{}')

        expect(() => rooms.getOrCreate(roomRequest)).toThrow('Room "name" is a mandatory field')
    })

    it('should throw an error when RoomRequest does not have rules', () => {
        const rooms = new Rooms()
        let roomRequest: RoomRequest = JSON.parse('{ "name": "Room Name" }')

        expect(() => rooms.getOrCreate(roomRequest)).toThrow('Room "rules" is not properly set')
    })

    it('should be able to create a new room', () => {
        const rooms = new Rooms()

        const room = rooms.getOrCreate({
            name: 'foo',
            code: '1234',
            rules: {
                min: 1,
                max: 3
            }
        })

        expect(rooms.has(room.id))
        expect(room.name).toEqual('foo')
        expect(room.code).toEqual('1234')
        expect(room.rules).toEqual({ min: 1, max: 3 })
        expect(room.id).toEqual('foo-1234')
        expect(room.users).toEqual({})
        expect(room.timestamp).toEqual(1615447648806)
    })

    it('should be able to retreive an already existing room', () => {
        const rooms = new Rooms()

        rooms.getOrCreate({
            name: 'foo',
            code: '1234',
            rules: {
                min: 1,
                max: 3
            }
        })

        const room = rooms.getOrCreate({
            name: 'foo',
            code: '1234',
            rules: {
                min: 1,
                max: 3
            }
        })

        expect(rooms.size).toEqual(1)
        expect(rooms.has(room.id))
    })

    it('should be able to delete a room', () => {
        const rooms = new Rooms()

        rooms.getOrCreate({
            name: 'foo',
            code: '1234',
            rules: {
                min: 1,
                max: 3
            }
        })

        rooms.getOrCreate({
            name: 'bar',
            code: 'abcd',
            rules: {
                min: 1,
                max: 3
            }
        })

        expect(rooms.size).toEqual(2)
        expect(rooms.has('bar-abcd')).toBeTruthy()
        expect(rooms.has('foo-1234')).toBeTruthy()

        rooms.delete('foo-1234')

        expect(rooms.size).toEqual(1)
        expect(rooms.has('bar-abcd')).toBeTruthy()
        expect(rooms.has('foo-1234')).toBeFalsy()
    })

    it('should be able to generate a unique code', () => {
        const rooms = new Rooms()

        uuidv4
            .mockReturnValueOnce('new-uuid1')
            .mockReturnValueOnce('new-uuid1')
            .mockReturnValueOnce('new-uuid1')
            .mockReturnValueOnce('new-uuid1')
            .mockReturnValueOnce('new-uuid2')

        const room1 = rooms.getOrCreate({
            name: 'bar',
            rules: {
                min: 1,
                max: 3
            }
        })

        expect(rooms.has(room1.id))
        expect(room1.name).toEqual('bar')
        expect(room1.code).toEqual('new-uuid1')
        expect(room1.id).toEqual('bar-new-uuid1')

        const room2 = rooms.getOrCreate({
            name: 'bar',
            rules: {
                min: 1,
                max: 3
            }
        })

        expect(rooms.has(room2.id))
        expect(room2.name).toEqual('bar')
        expect(room2.code).toEqual('new-uuid2')
        expect(room2.id).toEqual('bar-new-uuid2')
    })
})
