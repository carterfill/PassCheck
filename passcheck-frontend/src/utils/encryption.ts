/**
 * Client-side password encryption utility
 * Uses AES-256-GCM encryption (same as backend)
 */

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Derive encryption key from a password/secret
 * Uses the same method as backend (SHA-256 hash)
 */
async function deriveKey(secret: string): Promise<CryptoKey> {
  // Hash the secret using SHA-256 to get a 32-byte key (same as backend)
  const encoder = new TextEncoder();
  const secretBuffer = encoder.encode(secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', secretBuffer);
  
  // Import the hash as a key
  return crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: ALGORITHM },
    false,
    ['encrypt']
  );
}

/**
 * Convert Uint8Array to base64
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Encrypt password before sending to backend
 * Returns base64 encoded string: iv:authTag:encryptedData
 * Format matches backend decryption
 */
export async function encryptPassword(password: string): Promise<string> {
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required');
    }

    // Get encryption key from environment or use a default
    // This should match ENCRYPTION_KEY on backend
    const secret = import.meta.env.VITE_ENCRYPTION_SECRET || 'passcheck-default-secret-key-change-in-production';
    
    // Derive key (same method as backend)
    const key = await deriveKey(secret);

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Encrypt
    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: 128, // 128 bits = 16 bytes
      },
      key,
      encoder.encode(password)
    );

    // In GCM mode, Web Crypto API appends auth tag to the end
    const encryptedArray = new Uint8Array(encrypted);
    const authTag = encryptedArray.slice(encryptedArray.length - AUTH_TAG_LENGTH);
    const encryptedData = encryptedArray.slice(0, encryptedArray.length - AUTH_TAG_LENGTH);

    // Encode to base64
    const ivBase64 = uint8ArrayToBase64(iv);
    const authTagBase64 = uint8ArrayToBase64(authTag);
    const encryptedDataBase64 = uint8ArrayToBase64(encryptedData);

    // Return format: iv:authTag:encryptedData (matches backend)
    return `${ivBase64}:${authTagBase64}:${encryptedDataBase64}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt password');
  }
}

/**
 * Check if encryption is enabled
 */
export function isEncryptionEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_ENCRYPTION === 'true' || 
         import.meta.env.VITE_ENCRYPTION_SECRET !== undefined;
}

