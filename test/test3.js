const fs = require('fs')
const readline = require('readline')
const {
  generateSecret,
  generateQRCode,
  verifyToken
} = require('../dist/index.js');

async function main() {
  const secretInfo = generateSecret({
    issuer: 'TestApp',
    accountName: 'test@example.com'
  })

  const qrBase64 = await generateQRCode(secretInfo.otpAuthUrl, 'base64')
  const base64Data = qrBase64.split(',')[1]

  fs.writeFileSync('qr.png', Buffer.from(base64Data, 'base64'))

  console.log('Secret:', secretInfo.secret)
  console.log('QR saved as qr.png')

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('Enter OTP code: ', (code) => {
    const isValid = verifyToken(secretInfo.secret, code)
    console.log('Valid:', isValid)
    rl.close()
  })
}

main()
