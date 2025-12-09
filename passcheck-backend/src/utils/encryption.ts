import crypto from 'crypto';

// Encryption key from environment variable
// In production, this should be a strong random key (32 bytes for AES-256)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const AUTH_TAG_LENGTH = 16; // 16 bytes for GCM

// Derive a 32-byte key from the environment variable
function getKey(): Buffer {
  // If ENCRYPTION_KEY is already 32 bytes hex (64 chars), use it directly
  // Otherwise, derive a key using SHA-256
  if (ENCRYPTION_KEY.length === 64 && /^[0-9a-fA-F]+$/.test(ENCRYPTION_KEY)) {
    return Buffer.from(ENCRYPTION_KEY, 'hex');
  }
  // Derive a 32-byte key using SHA-256
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

/**
 * Decrypt password from encrypted string
 * Format: iv:authTag:encryptedData (all base64 encoded)
 */
export function decryptPassword(encrypted: string): string {
  try {
    if (!encrypted || typeof encrypted !== 'string') {
      throw new Error('Invalid encrypted data');
    }

    // Split the encrypted string into parts
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const [ivBase64, authTagBase64, encryptedDataBase64] = parts;
    
    // Decode from base64
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const encryptedData = Buffer.from(encryptedDataBase64, 'base64');

    // Validate lengths
    if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error('Invalid IV or auth tag length');
    }

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(encryptedData, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt password: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Check if a string is encrypted (has the format iv:authTag:encryptedData)
 */
export function isEncrypted(data: string): boolean {
  if (!data || typeof data !== 'string') {
    return false;
  }
  const parts = data.split(':');
  if (parts.length !== 3) {
    return false;
  }
  // Check if all parts are valid base64
  try {
    parts.forEach(part => {
      Buffer.from(part, 'base64');
    });
    return true;
  } catch {
    return false;
  }
}

