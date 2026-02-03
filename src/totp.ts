const crypto = require('crypto');
const createHmac = crypto.createHmac;
import { base32Decode } from './base32';
import type { TOTPAlgorithm } from './types';

/**
 * Generate HMAC-based One-Time Password
 * RFC 4226 compliant
 */
export function generateHOTP(
  secret: Buffer,
  counter: bigint,
  digits: number = 6,
  algorithm: TOTPAlgorithm = 'SHA-1'
): string {
  const algoMap: Record<TOTPAlgorithm, string> = {
    'SHA-1': 'sha1',
    'SHA-256': 'sha256',
    'SHA-512': 'sha512',
  };

  const counterBuffer = Buffer.alloc(8);
  let counterValue = counter;
  for (let i = 7; i >= 0; i--) {
    counterBuffer[i] = Number(counterValue & 0xffn);
    counterValue = counterValue >> 8n;
  }

  const hmac = createHmac(algoMap[algorithm], secret);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = (code % Math.pow(10, digits)).toString();
  return otp.padStart(digits, '0');
}

/**
 * Generate Time-based One-Time Password
 * RFC 6238 compliant
 */
export function generateTOTP(
  secret: string,
  timestamp: number = Math.floor(Date.now() / 1000),
  step: number = 30,
  digits: number = 6,
  algorithm: TOTPAlgorithm = 'SHA-1'
): string {
  const secretBuffer = base32Decode(secret);

  const counter = BigInt(Math.floor(timestamp / step));

  return generateHOTP(secretBuffer, counter, digits, algorithm);
}

/**
 * Verify Time-based One-Time Password with time window
 */
export function verifyTOTP(
  secret: string,
  token: string,
  timestamp: number = Math.floor(Date.now() / 1000),
  window: number = 1,
  step: number = 30,
  digits: number = 6,
  algorithm: TOTPAlgorithm = 'SHA-1'
): boolean {
  for (let i = -window; i <= window; i++) {
    const adjustedTimestamp = timestamp + i * step;
    const expectedToken = generateTOTP(
      secret,
      adjustedTimestamp,
      step,
      digits,
      algorithm
    );

    if (constantTimeCompare(token, expectedToken)) {
      return true;
    }
  }

  return false;
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
