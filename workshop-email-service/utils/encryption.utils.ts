
import crypto from 'crypto-js';

// Encryption key from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

/**
 * Encrypt sensitive data
 */
export function encryptData(data: string): string {
  return crypto.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string): string {
  const bytes = crypto.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(crypto.enc.Utf8);
}

/**
 * Generate a secure random key
 */
export function generateEncryptionKey(): string {
  return crypto.lib.WordArray.random(16).toString();
}
