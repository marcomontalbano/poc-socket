import { Room } from './Room'

describe('Room', () => {

    beforeEach(() => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1615447648806)
    })

    afterEach(() => {
        jest.spyOn(Date, 'now').mockRestore()
    })

    it('should be creatable given a list of options', () => {
        const room = new Room({
            name: 'foo',
            code: '1234',
            rules: {
                min: 1,
                max: 3
            }
        })

        expect(room.name).toEqual('foo')
        expect(room.code).toEqual('1234')
        expect(room.rules).toEqual({ min: 1, max: 3 })
        expect(room.id).toEqual('foo-1234')
        expect(room.users).toEqual({})
        expect(room.timestamp).toEqual(1615447648806)
    })

    it('should be able to add a user', () => {
        const room = new Room({
            name: 'foo',
            code: '1234',
            rules: {
                min: 1,
                max: 3
            }
        })

        room.addUser('john-doe', { firstName: 'john' })

        expect(room.users).toEqual({
            'john-doe': {
                uid: 'john-doe',
                data: { firstName: 'john' },
                timestamp: 1615447648806
            }
        })
    })

    it('should be able to delete a user', () => {
        const room = new Room({
            name: 'foo',
            code: '1234',
            rules: {
                min: 1,
                max: 3
            }
        })

        room.addUser('john-doe', {})
        room.removeUser('john-doe')

        expect(room.users).toEqual({})
    })

    it('should throw an error when adding a user that already exist', () => {
        const room = new Room({
            name: 'foo',
            code: '1234',
            rules: {
                min: 1,
                max: 3
            }
        })

        room.addUser('john-doe', {})
        expect(() => room.addUser('john-doe', {})).toThrowError()
    })

    it('should throw an error when room rules are broken', () => {
        const room = new Room({
            name: 'foo',
            code: '1234',
            rules: {
                min: 1,
                max: 2
            }
        })

        room.addUser('john-doe', {})
        room.addUser('foo-bar', {})
        expect(() => room.addUser('new-user', {})).toThrowError()
    })

    it('should be ready when room rules are met', () => {
        const room = new Room({
            name: 'foo',
            code: '1234',
            rules: {
                min: 1,
                max: 2
            }
        })

        expect(room.isReady()).toBeFalsy()

        room.addUser('john-doe', {})

        expect(room.isReady()).toBeTruthy()

        room.addUser('foo-bar', {})

        expect(room.isReady()).toBeTruthy()
        expect(room.isFull()).toBeTruthy()
    })
})
