import { connect } from './src/simple/socket-server'

const corsOrigin = process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.split(',')

connect({
    srv: parseInt(process.env.PORT || '3000'),
    corsOrigin
})
