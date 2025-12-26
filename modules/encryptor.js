/**
 * Utility module for encryption via `Web Crypto API`
 * - Exports `encryptor` utility object
 * 
 * @module encryptor
 * @author Ben Scarletti
 * @since 2025-08-27
 * @modified 2025-12-12
 * @see {@link https://github.com/scarletti-ben}
 * @license MIT
 */

// < ======================================================
// < Internal Functions
// < ======================================================

/**
 * Decode a `Base64` string to bytes
 * 
 * @param {string} base64String - The `Base64` string to decode
 * @returns {ArrayBuffer}  The decoded bytes as an `ArrayBuffer`
 */
function base64ToBytes(base64String) {
    const byteString = window.atob(base64String);
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
    }
    return byteArray.buffer;
}

/**
 * Encode bytes to a `Base64` string
 * 
 * @param {ArrayBuffer | Uint8Array} buffer - The bytes as `ArrayBuffer` or `Uint8Array`
 * @returns {string} The encoded `Base64` string
 */
function bytesToBase64(buffer) {
    let byteString = '';
    const byteArray = new Uint8Array(buffer);
    for (let i = 0; i < byteArray.byteLength; i++) {
        byteString += String.fromCharCode(byteArray[i]);
    }
    return window.btoa(byteString);
}

// < ======================================================
// < Encryptor Functions
// < ======================================================

/**
 * Derive a `CryptoKey` from a given password and salt
 * - Key is non-extractable, and should not be serialisable
 *     - Should only be usable on the system that derived the key
 *     - Cannot be wrapped or transferred
 *     - Can be safely stored in `IndexedDB`
 * - `PBKDF2` / `SHA-256` / `AES-GCM` / `i = 100_000`
 * 
 * @param {string} password - The password to derive the key from
 * @param {string} salt - The salt to derive the key from
 * @returns {Promise<CryptoKey>} The derived `CryptoKey` object
 */
async function deriveKey(password, salt) {

    // > Text encoder used for encoding strings to bytes
    const encoder = new TextEncoder();

    // > Generate master key for use by deriveKey
    const masterKey = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    // > Derive secret key from master key
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode(salt),
            iterations: 100000,
            hash: "SHA-256"
        },
        masterKey,
        {
            name: "AES-GCM",
            length: 256
        },
        false,
        [
            "encrypt",
            "decrypt"
        ]
    );

}

/**
 * Encrypt text string using a given `CryptoKey`
 * 
 * @param {string} text - The text string to encrypt
 * @param {CryptoKey} key - The `CryptoKey` for encryption
 * @returns {Promise<string>} The ciphertext and IV as a comma-separated `Base64` string
 */
async function encrypt(text, key) {
    const textBytes = new TextEncoder().encode(text);
    const IVBytes = window.crypto.getRandomValues(new Uint8Array(12));
    const cipherBytes = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: IVBytes
        },
        key,
        textBytes
    );
    const IV64 = bytesToBase64(IVBytes);
    const ciphertext64 = bytesToBase64(cipherBytes);
    return ciphertext64 + ',' + IV64;
}

/**
 * Decrypt `Base64` string using a given `CryptoKey`
 * 
 * @param {string} encrypted64 - The ciphertext and IV as a comma-separated `Base64` string
 * @param {CryptoKey} key - The `CryptoKey` for decryption
 * @returns {Promise<string>} The decrypted text string
 */
async function decrypt(encrypted64, key) {
    const [ciphertext64, IV64] = encrypted64.split(',');
    const ciphertextBytes = base64ToBytes(ciphertext64);
    const IVBytes = base64ToBytes(IV64);
    const textBytes = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: IVBytes
        },
        key,
        ciphertextBytes
    );
    return new TextDecoder().decode(textBytes);
}

// > ======================================================
// > Exports
// > ======================================================

/**
 * Utility object for interacting with `Web Crypto API`
 * 
 * @example
 * import {
 *     encryptor
 * } from "./modules/encryptor.js";
 * 
 * const text = 'test';
 * const key = await encryptor.deriveKey('password', 'salt');
 * const encryptedText = await encryptor.encrypt(text, key);
 * const decryptedText = await encryptor.decrypt(encryptedText, key);
 * console.log(decryptedText == text);
 */
export const encryptor = {
    deriveKey,
    encrypt,
    decrypt
}