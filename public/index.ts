import { socket } from '../src/socket-client'

socket.on('message', (message: string) => {
    const div = document.createElement('div');
    div.innerHTML = message;
    document.getElementById('log')?.append(div)
})

document.querySelector('form')?.addEventListener('submit', event => {
    event.preventDefault();

    const input = document.getElementById('message') as HTMLInputElement;
    const message = input.value;
    input.value = '';

    socket.emit('message', message);
    console.log('emit', message)
})