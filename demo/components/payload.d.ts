export type MessagePayload = {
    type: 'message'
    id: string
    name: string
    message: string
}

export type OtherPayload = {
    type: 'other',
    id: string
    name: string
}

export type Payload = MessagePayload | OtherPayload
