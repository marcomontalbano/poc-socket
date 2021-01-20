import { io } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'

const newCode = `#${uuidv4()}`;
const existingCode = location.hash;
const code = existingCode || newCode;
const isNewCode = newCode === code;

if (isNewCode) {
    location.hash = code;
}

export const socket = io('localhost:3000', {
    query: `code=${code}`
})
