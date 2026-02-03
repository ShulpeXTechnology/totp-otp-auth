/**
 * QR Code Generator
 * Using qrcode library for OTP URLs
 */

import QRCode from 'qrcode';

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(data: string): Promise<string> {
  return QRCode.toString(data, {
    type: 'svg',
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
}

/**
 * Generate QR code as Base64 data URL
 */
export async function generateQRCodeBase64(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    type: 'image/png',
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
}
