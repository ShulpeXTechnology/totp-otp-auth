const crypto = require('crypto');
const randomBytes = crypto.randomBytes;
import { base32Encode } from './base32';
import { generateTOTP, verifyTOTP } from './totp';
import { generateQRCodeSVG, generateQRCodeBase64 } from './qrcode';
import type {
  SecretOptions,
  SecretInfo,
  TokenOptions,
  VerifyOptions,
  QRCodeOptions,
  QRCodeFormat,
} from './types';

/**
 * Generate a secure random Base32 secret
 * @param options - Secret generation options
 * @returns Secret information including OTP Auth URL
 */
export function generateSecret(options: SecretOptions): SecretInfo {
  const { issuer, accountName, secretLength = 20 } = options;

  if (!issuer || !accountName) {
    throw new Error('Issuer and account name are required');
  }

  const buffer = randomBytes(secretLength);
  const secret = base32Encode(buffer);

  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  const otpAuthUrl = `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}`;

  return {
    secret,
    otpAuthUrl,
    issuer,
    accountName,
  };
}

/**
 * Generate a QR code from an OTP Auth URL
 * @param options - QR code generation options
 * @returns QR code as Base64 data URL or SVG string
 */
export async function generateQRCode(options: QRCodeOptions): Promise<string>;
export async function generateQRCode(
  otpAuthUrl: string,
  format?: QRCodeFormat
): Promise<string>;
export async function generateQRCode(
  optionsOrUrl: QRCodeOptions | string,
  format: QRCodeFormat = 'base64'
): Promise<string> {
  let otpAuthUrl: string;
  let outputFormat: QRCodeFormat;

  if (typeof optionsOrUrl === 'string') {
    otpAuthUrl = optionsOrUrl;
    outputFormat = format;
  } else {
    otpAuthUrl = optionsOrUrl.otpAuthUrl;
    outputFormat = optionsOrUrl.format || 'base64';
  }

  if (!otpAuthUrl) {
    throw new Error('OTP Auth URL is required');
  }

  if (!otpAuthUrl.startsWith('otpauth://')) {
    throw new Error('Invalid OTP Auth URL');
  }

  if (outputFormat === 'svg') {
    return await generateQRCodeSVG(otpAuthUrl);
  } else {
    return await generateQRCodeBase64(otpAuthUrl);
  }
}

/**
 * Generate a TOTP token
 * @param options - Token generation options
 * @returns 6-digit TOTP token
 */
export function generateToken(options: TokenOptions): string;
export function generateToken(secret: string): string;
export function generateToken(optionsOrSecret: TokenOptions | string): string {
  let secret: string;
  let step: number = 30;
  let digits: number = 6;
  let algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512' = 'SHA-1';
  let timestamp: number = Math.floor(Date.now() / 1000);

  if (typeof optionsOrSecret === 'string') {
    secret = optionsOrSecret;
  } else {
    secret = optionsOrSecret.secret;
    step = optionsOrSecret.step || 30;
    digits = optionsOrSecret.digits || 6;
    algorithm = optionsOrSecret.algorithm || 'SHA-1';
    timestamp = optionsOrSecret.timestamp || Math.floor(Date.now() / 1000);
  }

  if (!secret) {
    throw new Error('Secret is required');
  }

  return generateTOTP(secret, timestamp, step, digits, algorithm);
}

/**
 * Verify a TOTP token
 * @param options - Verification options
 * @returns true if token is valid, false otherwise
 */
export function verifyToken(options: VerifyOptions): boolean;
export function verifyToken(secret: string, token: string): boolean;
export function verifyToken(
  optionsOrSecret: VerifyOptions | string,
  token?: string
): boolean {
  let secret: string;
  let tokenToVerify: string;
  let window: number = 1;
  let step: number = 30;
  let digits: number = 6;
  let algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512' = 'SHA-1';
  let timestamp: number = Math.floor(Date.now() / 1000);

  if (typeof optionsOrSecret === 'string') {
    if (!token) {
      throw new Error('Token is required');
    }
    secret = optionsOrSecret;
    tokenToVerify = token;
  } else {
    secret = optionsOrSecret.secret;
    tokenToVerify = optionsOrSecret.token;
    window = optionsOrSecret.window !== undefined ? optionsOrSecret.window : 1;
    step = optionsOrSecret.step || 30;
    digits = optionsOrSecret.digits || 6;
    algorithm = optionsOrSecret.algorithm || 'SHA-1';
    timestamp = optionsOrSecret.timestamp || Math.floor(Date.now() / 1000);
  }

  if (!secret || !tokenToVerify) {
    throw new Error('Secret and token are required');
  }


  tokenToVerify = tokenToVerify.replace(/[\s-]/g, '');

  return verifyTOTP(secret, tokenToVerify, timestamp, window, step, digits, algorithm);
}


export * from './types';
