import { connect } from './src/socket-server'

connect({
    srv: parseInt(process.env.PORT || '3000'),
    corsOrigin: [
        'http://localhost:1234'
    ]
})
