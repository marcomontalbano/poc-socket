import { connect } from '../src/socket-client'

const socket = connect({
    uri: 'localhost:3000',
    code: location.hash ? location.hash.replace(/^#/, '') : null
});

socket.on('initialized', code => {
    location.hash = code;
})

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