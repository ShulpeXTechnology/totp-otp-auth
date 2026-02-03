const { generateToken } = require('../dist/index.js');

const secret = '1234567489'

const token = generateToken(secret)

console.log('OTP Code:', token)
