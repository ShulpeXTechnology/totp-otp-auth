/**
 * Base32 encoding/decoding utilities
 * RFC 4648 compliant
 */

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Encode buffer to Base32 string
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decode Base32 string to buffer
 */
export function base32Decode(base32: string): Buffer {
  base32 = base32.replace(/\s/g, '').toUpperCase();

  let bits = 0;
  let value = 0;
  let index = 0;
  const output = Buffer.alloc(Math.ceil((base32.length * 5) / 8));

  for (let i = 0; i < base32.length; i++) {
    const char = base32[i];
    const charIndex = BASE32_CHARS.indexOf(char);

    if (charIndex === -1) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }

    value = (value << 5) | charIndex;
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }

  return output.slice(0, index) as unknown as Buffer;
}
