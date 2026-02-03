/**
 * Algorithm types supported for TOTP generation
 */
export type TOTPAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512';

/**
 * QR Code output format
 */
export type QRCodeFormat = 'base64' | 'svg';

/**
 * Secret generation options
 */
export interface SecretOptions {
  /** Issuer name (e.g., "MyApp") */
  issuer: string;
  /** Account name (e.g., user email) */
  accountName: string;
  /** Secret length in bytes (default: 20) */
  secretLength?: number;
}

/**
 * Generated secret information
 */
export interface SecretInfo {
  /** Base32 encoded secret */
  secret: string;
  /** OTP Auth URL for QR code generation */
  otpAuthUrl: string;
  /** Issuer name */
  issuer: string;
  /** Account name */
  accountName: string;
}

/**
 * Token generation options
 */
export interface TokenOptions {
  /** Base32 encoded secret */
  secret: string;
  /** Time step in seconds (default: 30) */
  step?: number;
  /** Number of digits in token (default: 6) */
  digits?: number;
  /** Hashing algorithm (default: SHA-1) */
  algorithm?: TOTPAlgorithm;
  /** Unix timestamp in seconds (default: current time) */
  timestamp?: number;
}

/**
 * Token verification options
 */
export interface VerifyOptions {
  /** Base32 encoded secret */
  secret: string;
  /** User-provided token to verify */
  token: string;
  /** Time window for tolerance (±N steps, default: 1) */
  window?: number;
  /** Time step in seconds (default: 30) */
  step?: number;
  /** Number of digits in token (default: 6) */
  digits?: number;
  /** Hashing algorithm (default: SHA-1) */
  algorithm?: TOTPAlgorithm;
  /** Unix timestamp in seconds (default: current time) */
  timestamp?: number;
}

/**
 * QR Code generation options
 */
export interface QRCodeOptions {
  /** OTP Auth URL */
  otpAuthUrl: string;
  /** Output format (default: 'base64') */
  format?: QRCodeFormat;
}
