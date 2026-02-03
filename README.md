# TOTP/OTP Auth Library

[![npm version](https://badge.fury.io/js/totp-otp-auth.svg)](https://www.npmjs.com/package/totp-otp-auth)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-ready, zero-dependency TOTP/OTP authentication library for Node.js, Bun, and Deno. Generate secure secrets, QR codes, and verify time-based tokens compatible with **Google Authenticator**, **Authy**, and **Microsoft Authenticator**.

## ✨ Features

- 🔐 **RFC 6238 (TOTP) & RFC 4226 (HOTP) compliant**
- 🎯 **Zero dependencies** - uses only native Node.js crypto
- 📱 **Compatible with all major authenticator apps**
- 🖼️ **QR code generation** (SVG and Base64)
- 🔧 **Full TypeScript support** with complete type definitions
- ⚡ **Works in Node.js, Bun, and Deno**
- 🛡️ **Security-first** - constant-time comparison, no secret storage

## 📦 Installation

```bash
npm install totp-otp-auth
```

Or with other package managers:

```bash
yarn add totp-otp-auth
pnpm add totp-otp-auth
bun add totp-otp-auth
```

## 🚀 Quick Start

### JavaScript

```javascript
const { generateSecret, generateQRCode, generateToken, verifyToken } = require('totp-otp-auth');

async function setupAuth() {
  // 1. Generate a secret
  const secretInfo = generateSecret({
    issuer: 'MyApp',
    accountName: 'user@example.com'
  });

  console.log('Secret:', secretInfo.secret);
  console.log('OTP Auth URL:', secretInfo.otpAuthUrl);

  // 2. Generate QR code (async)
  const qrCode = await generateQRCode(secretInfo.otpAuthUrl, 'base64');
  console.log('QR Code (Base64):', qrCode);

  // 3. Generate a token
  const token = generateToken(secretInfo.secret);
  console.log('Current Token:', token);

  // 4. Verify a token
  const isValid = verifyToken(secretInfo.secret, token);
  console.log('Token Valid:', isValid);
}

setupAuth();
```

### TypeScript

```typescript
import {
  generateSecret,
  generateQRCode,
  generateToken,
  verifyToken,
  type SecretInfo,
  type TokenOptions
} from 'totp-otp-auth';

// Generate secret with full typing
const secretInfo: SecretInfo = generateSecret({
  issuer: 'MyApp',
  accountName: 'user@example.com',
  secretLength: 20 // optional, default: 20
});

// Generate token with options
const token: string = generateToken({
  secret: secretInfo.secret,
  step: 30,      // optional, default: 30 seconds
  digits: 6,     // optional, default: 6
  algorithm: 'SHA-1' // optional, default: 'SHA-1'
});

// Verify with tolerance window
const isValid: boolean = verifyToken({
  secret: secretInfo.secret,
  token: token,
  window: 1 // optional, allows ±1 time step tolerance
});
```

## 📖 API Reference

### `generateSecret(options: SecretOptions): SecretInfo`

Generates a secure random Base32 secret for TOTP.

**Parameters:**
- `options.issuer` (string, required) - The service name (e.g., "MyApp")
- `options.accountName` (string, required) - User identifier (e.g., email)
- `options.secretLength` (number, optional) - Secret length in bytes (default: 20)

**Returns:**
```typescript
{
  secret: string;        // Base32 encoded secret
  otpAuthUrl: string;    // otpauth:// URL for QR code
  issuer: string;        // Service name
  accountName: string;   // User identifier
}
```

**Example:**
```javascript
const secret = generateSecret({
  issuer: 'MyCompany',
  accountName: 'john.doe@example.com'
});
```

---

### `generateQRCode(options: QRCodeOptions | string, format?: 'base64' | 'svg'): Promise<string>`

Generates a QR code from an OTP Auth URL **(async function)**.

**Parameters:**
- `otpAuthUrl` (string) - The OTP Auth URL from `generateSecret()`
- `format` (string, optional) - Output format: `'base64'` (default) or `'svg'`

**Returns:**
- Promise<string> - Base64 data URL (`data:image/png;base64,...`) or SVG string

**Examples:**
```javascript
// Base64 (can be used directly in <img> src)
const qrBase64 = await generateQRCode(secretInfo.otpAuthUrl);
// <img src={qrBase64} alt="QR Code" />

// SVG string (for direct rendering)
const qrSvg = await generateQRCode(secretInfo.otpAuthUrl, 'svg');

// Object syntax
const qrCode = await generateQRCode({
  otpAuthUrl: secretInfo.otpAuthUrl,
  format: 'base64'
});
```

---

### `generateToken(options: TokenOptions | string): string`

Generates a TOTP token.

**Parameters:**
- `secret` (string) - Base32 encoded secret
- `step` (number, optional) - Time step in seconds (default: 30)
- `digits` (number, optional) - Token length (default: 6)
- `algorithm` (string, optional) - Hash algorithm: `'SHA-1'`, `'SHA-256'`, or `'SHA-512'` (default: `'SHA-1'`)
- `timestamp` (number, optional) - Unix timestamp in seconds (default: current time)

**Returns:**
- String token (e.g., "123456")

**Examples:**
```javascript
// Simple usage
const token = generateToken(secret);

// Advanced options
const token = generateToken({
  secret: secret,
  step: 30,
  digits: 8,
  algorithm: 'SHA-256'
});
```

---

### `verifyToken(options: VerifyOptions | secret: string, token: string): boolean`

Verifies a TOTP token with time window tolerance.

**Parameters:**
- `secret` (string) - Base32 encoded secret
- `token` (string) - User-provided token to verify
- `window` (number, optional) - Time window tolerance (±N steps, default: 1)
- `step` (number, optional) - Time step in seconds (default: 30)
- `digits` (number, optional) - Token length (default: 6)
- `algorithm` (string, optional) - Hash algorithm (default: `'SHA-1'`)
- `timestamp` (number, optional) - Unix timestamp in seconds (default: current time)

**Returns:**
- `true` if token is valid, `false` otherwise

**Examples:**
```javascript
// Simple usage
const isValid = verifyToken(secret, '123456');

// With tolerance window (allows ±1 time step = ±30 seconds by default)
const isValid = verifyToken({
  secret: secret,
  token: userInput,
  window: 2 // allows ±60 seconds tolerance
});
```

---

## 🔒 Security Best Practices

### 1. Secret Storage
**Never store secrets in plain text!** Always encrypt secrets before storing them in your database.

```javascript
// ❌ DON'T DO THIS
await db.users.update({ id: userId }, { totpSecret: secret });

// ✅ DO THIS
const encryptedSecret = encrypt(secret, encryptionKey);
await db.users.update({ id: userId }, { totpSecret: encryptedSecret });
```

### 2. Rate Limiting
Implement rate limiting to prevent brute force attacks:

```javascript
const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

let attempts = 0;
let lockoutUntil = 0;

function verifyWithRateLimit(secret, token) {
  if (Date.now() < lockoutUntil) {
    throw new Error('Too many failed attempts. Try again later.');
  }

  const isValid = verifyToken(secret, token);

  if (!isValid) {
    attempts++;
    if (attempts >= MAX_ATTEMPTS) {
      lockoutUntil = Date.now() + LOCKOUT_TIME;
    }
    return false;
  }

  attempts = 0;
  return true;
}
```

### 3. Time Window
Use a reasonable time window (default is ±1 step = ±30 seconds):

```javascript
// Too strict - may reject valid tokens due to clock drift
verifyToken({ secret, token, window: 0 });

// Recommended - allows for small clock differences
verifyToken({ secret, token, window: 1 }); // default

// Too loose - increases security risk
verifyToken({ secret, token, window: 5 });
```

### 4. HTTPS Only
Always serve QR codes and handle TOTP over HTTPS to prevent man-in-the-middle attacks.

---

## 🌐 Full Integration Example

### Express.js Server

```javascript
const express = require('express');
const { generateSecret, generateQRCode, verifyToken } = require('totp-otp-auth');

const app = express();
app.use(express.json());

// Setup endpoint - user enables 2FA
app.post('/api/2fa/setup', async (req, res) => {
  const userId = req.user.id;
  const email = req.user.email;

  // Generate secret
  const secretInfo = generateSecret({
    issuer: 'MyApp',
    accountName: email
  });

  // Store encrypted secret in database
  await db.users.update(userId, {
    totpSecret: encrypt(secretInfo.secret)
  });

  // Generate QR code (async)
  const qrCode = await generateQRCode(secretInfo.otpAuthUrl, 'base64');

  res.json({
    secret: secretInfo.secret, // Show once for manual entry
    qrCode: qrCode
  });
});

// Verify endpoint - user logs in with 2FA
app.post('/api/2fa/verify', async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;

  // Get encrypted secret from database
  const user = await db.users.findById(userId);
  const secret = decrypt(user.totpSecret);

  // Verify token
  const isValid = verifyToken(secret, token);

  if (isValid) {
    res.json({ success: true, message: 'Authentication successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

app.listen(3000);
```

### React Frontend

```jsx
import { useState } from 'react';

function TwoFactorSetup() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');

  const setupTwoFactor = async () => {
    const response = await fetch('/api/2fa/setup', { method: 'POST' });
    const data = await response.json();
    
    setQrCode(data.qrCode);
    setSecret(data.secret);
  };

  return (
    <div>
      <button onClick={setupTwoFactor}>Enable 2FA</button>
      
      {qrCode && (
        <div>
          <h3>Scan this QR code with your authenticator app:</h3>
          <img src={qrCode} alt="2FA QR Code" />
          <p>Or enter this code manually: <code>{secret}</code></p>
        </div>
      )}
    </div>
  );
}

function TwoFactorLogin() {
  const [token, setToken] = useState('');

  const verifyToken = async () => {
    const response = await fetch('/api/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    const data = await response.json();
    alert(data.message);
  };

  return (
    <div>
      <input
        type="text"
        maxLength="6"
        placeholder="Enter 6-digit code"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button onClick={verifyToken}>Verify</button>
    </div>
  );
}
```

---

## 🧪 Testing

Create a test file to verify the library:

```javascript
const { generateSecret, generateToken, verifyToken } = require('totp-otp-auth');

// Test 1: Generate secret
console.log('Test 1: Generate Secret');
const secretInfo = generateSecret({
  issuer: 'TestApp',
  accountName: 'test@example.com'
});
console.log('✓ Secret generated:', secretInfo.secret);
console.log('✓ OTP Auth URL:', secretInfo.otpAuthUrl);

// Test 2: Generate token
console.log('\nTest 2: Generate Token');
const token = generateToken(secretInfo.secret);
console.log('✓ Token generated:', token);
console.log('✓ Token length:', token.length);

// Test 3: Verify token
console.log('\nTest 3: Verify Token');
const isValid = verifyToken(secretInfo.secret, token);
console.log('✓ Token valid:', isValid);

// Test 4: Invalid token
console.log('\nTest 4: Invalid Token');
const isInvalid = verifyToken(secretInfo.secret, '000000');
console.log('✓ Invalid token rejected:', !isInvalid);

console.log('\n✅ All tests passed!');
```

---

## 🔧 Advanced Usage

### Custom Time Step

```javascript
// 60-second time step (less frequent token changes)
const token = generateToken({
  secret: secret,
  step: 60
});

const isValid = verifyToken({
  secret: secret,
  token: token,
  step: 60
});
```

### 8-Digit Tokens

```javascript
const token = generateToken({
  secret: secret,
  digits: 8
});

const isValid = verifyToken({
  secret: secret,
  token: token,
  digits: 8
});
```

### SHA-256 Algorithm

```javascript
const token = generateToken({
  secret: secret,
  algorithm: 'SHA-256'
});

const isValid = verifyToken({
  secret: secret,
  token: token,
  algorithm: 'SHA-256'
});
```

---

## 📱 Authenticator App Compatibility

This library generates tokens compatible with:

- ✅ **Google Authenticator** (iOS, Android)
- ✅ **Authy** (iOS, Android, Desktop)
- ✅ **Microsoft Authenticator** (iOS, Android)
- ✅ **1Password** (with TOTP support)
- ✅ **LastPass Authenticator**
- ✅ **Any RFC 6238 compliant app**

---

## 🌍 Runtime Support

### Node.js
```javascript
const totp = require('totp-otp-auth');
```

### Bun
```javascript
import * as totp from 'totp-otp-auth';
```

### Deno
```typescript
import * as totp from 'npm:totp-otp-auth';
```

---

## 📝 TypeScript Types

```typescript
// All exported types
import type {
  SecretOptions,
  SecretInfo,
  TokenOptions,
  VerifyOptions,
  QRCodeOptions,
  QRCodeFormat,
  TOTPAlgorithm
} from 'totp-otp-auth';
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- RFC 6238: TOTP: Time-Based One-Time Password Algorithm
- RFC 4226: HOTP: An HMAC-Based One-Time Password Algorithm
- RFC 4648: Base32 Encoding

---

## 📞 Support

If you have any questions or need help, please:
- Open an issue on [GitHub](https://github.com/iimazin11/totp-otp-auth/issues)
- Check the [documentation](https://github.com/iimazin11/totp-otp-auth#readme)

---

**Made with ❤️ for secure authentication**
#   t o t p - o t p - a u t h  
 #   t o t p - o t p - a u t h  
 