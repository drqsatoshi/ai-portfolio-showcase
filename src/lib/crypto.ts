/**
 * End-to-End Encryption Utilities for BitChat
 * Uses Web Crypto API for:
 * - X25519 (ECDH) for key exchange
 * - AES-256-GCM for message encryption
 * - Ed25519 for message signing
 */

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface EncryptedMessage {
  type: 'ENCRYPTED_MSG';
  ciphertext: string; // base64
  nonce: string; // base64
  signature: string; // base64
  senderPublicKey: string; // base64
}

/**
 * Generate ECDH keypair for key exchange (X25519)
 */
export async function generateKeyExchangeKeyPair(): Promise<KeyPair> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256', // Using P-256 as X25519 is not widely supported in Web Crypto
    },
    true,
    ['deriveKey', 'deriveBits']
  );
  return keyPair;
}

/**
 * Generate Ed25519-like keypair for signing (using ECDSA with P-256)
 */
export async function generateSigningKeyPair(): Promise<KeyPair> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify']
  );
  return keyPair;
}

/**
 * Derive shared secret from ECDH key exchange
 */
export async function deriveSharedSecret(
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<CryptoKey> {
  const sharedSecret = await window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: publicKey,
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
  return sharedSecret;
}

/**
 * Encrypt a message using AES-256-GCM
 */
export async function encryptMessage(
  message: string,
  sharedSecret: CryptoKey,
  signingKey: CryptoKey,
  senderPublicKey: CryptoKey
): Promise<EncryptedMessage> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  // Generate random nonce (12 bytes for GCM)
  const nonce = window.crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the message
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
    },
    sharedSecret,
    data
  );

  // Sign the ciphertext
  const signature = await window.crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' },
    },
    signingKey,
    ciphertext
  );

  // Export sender's public key
  const publicKeyData = await window.crypto.subtle.exportKey('raw', senderPublicKey);

  // Convert to base64
  return {
    type: 'ENCRYPTED_MSG',
    ciphertext: arrayBufferToBase64(ciphertext),
    nonce: arrayBufferToBase64(nonce),
    signature: arrayBufferToBase64(signature),
    senderPublicKey: arrayBufferToBase64(publicKeyData),
  };
}

/**
 * Decrypt a message using AES-256-GCM
 */
export async function decryptMessage(
  encryptedMsg: EncryptedMessage,
  sharedSecret: CryptoKey,
  senderSigningPublicKey: CryptoKey
): Promise<string> {
  // Convert from base64
  const ciphertext = base64ToArrayBuffer(encryptedMsg.ciphertext);
  const nonce = base64ToArrayBuffer(encryptedMsg.nonce);
  const signature = base64ToArrayBuffer(encryptedMsg.signature);

  // Verify signature
  const isValid = await window.crypto.subtle.verify(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' },
    },
    senderSigningPublicKey,
    signature,
    ciphertext
  );

  if (!isValid) {
    throw new Error('Invalid signature - message may be tampered');
  }

  // Decrypt the message
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
    },
    sharedSecret,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Export public key to base64 string
 */
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Import public key from base64 string (for key exchange)
 */
export async function importKeyExchangePublicKey(base64Key: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(base64Key);
  return await window.crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
}

/**
 * Import public key from base64 string (for signing verification)
 */
export async function importSigningPublicKey(base64Key: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(base64Key);
  return await window.crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['verify']
  );
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
