// < ======================================================
// < Imports
// < ======================================================

import {
    encryptor
} from "./modules/encryptor.js";

// < ======================================================
// < Declarations
// < ======================================================

/**
 * Default password for debugging
 * 
 * @type {string}
 */
const DEFAULT_PASSWORD = `password`;

/**
 * Default salt for debugging
 * 
 * @type {string}
 */
const DEFAULT_SALT = `salt`;

/**
 * `CryptoKey` object from Web Crypto API
 * 
 * @type {CryptoKey | undefined}
 */
let cryptoKey;

// < ======================================================
// < Element Queries
// < ======================================================

/** 
 * Lookup object of DOM elements
 */
const queries = {

    /** @type {HTMLDivElement} */
    page: document.getElementById('page')

}

// < ======================================================
// < Functions
// < ======================================================

/**
 * Derive a `CryptoKey` via `PBKDF2` from user prompt
 * 
 * @param {boolean} bypass - Option to bypass user prompt and use default values [false]
 */
async function createKey(bypass = false) {
    const password = bypass ? DEFAULT_PASSWORD : (prompt("Password:") || DEFAULT_PASSWORD);
    const salt = bypass ? DEFAULT_SALT : (prompt("Salt:") || DEFAULT_SALT);
    const key = await encryptor.deriveKey(password, salt);
    return key;
}

/**
 * Encrypt a serialisable object to string using a given `CryptoKey`
 * 
 * @param {object} obj - The object to encrypt
 * @param {CryptoKey} key - The `CryptoKey` for encryption
 * @returns {Promise<string>} The ciphertext and IV as a comma-separated `Base64` string
 */
async function encryptObjectToString(obj, key) {
    const objectString = JSON.stringify(obj);
    const encryptedString = await encryptor.encrypt(objectString, key);
    return encryptedString;
}

/**
 * Decrypt a `Base64` string using a given `CryptoKey`
 * 
 * @param {string} str - The ciphertext and IV as a comma-separated `Base64` string
 * @param {CryptoKey} key - The `CryptoKey` for decryption
 * @returns {Promise<object>} The decrypted object
 */
async function decryptStringToObject(str, key) {
    const decryptedString = await encryptor.decrypt(str, key);
    const decryptedObject = JSON.parse(decryptedString);
    return decryptedObject;
}

/**
 * Upload a file via user prompt
 * 
 * @param {(file: File) => void} callback - Function to call when the selected file is uploaded
 * @param {string} accept - File types to accept ['*']
 */
function uploadFile(callback, accept = '*') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (event) => {
        callback(event.target.files[0]);
    };
    input.click();
}

/**
 * Download a serialisable object as a `.json` file
 * 
 * @param {*} data - The object to serialise and download
 * @param {string} filename The name for the file ['data.json']
 * @throws If the data is not serialisable
 */
function downloadJson(data, filename = 'data.json') {
    const text = JSON.stringify(data, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

/**
 * Download text as a `.enc` file
 * 
 * @param {string} text - The text to download
 * @param {string} filename The name for the file ['data.enc']
 */
function downloadEnc(text, filename = 'data.enc') {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

/**
 * Add a `<button>` element to the page
 * 
 * @param {string} text Text to show on the button
 * @param {(event: MouseEvent) => void} func - Function to call when clicked
 * @returns {HTMLButtonElement} The `<button>` element
 */
function addButton(text, func) {
    const button = document.createElement('button');
    button.title = text;
    button.textContent = text;
    button.onclick = func;
    queries.page.appendChild(button);
    return button;
}

// ~ ======================================================
// ~ Entry Point
// ~ ======================================================

// ? Run callback when all resources have loaded
window.addEventListener('load', async () => {

    // < ======================================================
    // < Buttons
    // < ======================================================

    const encryptButton = addButton('json-enc', () => {

        // Convert a raw `.json` file to an encrypted `.enc` file and download
        uploadFile(async (file) => {
            const rawObject = JSON.parse(await file.text());
            const encryptedString = await encryptObjectToString(rawObject, cryptoKey);
            downloadEnc(encryptedString);
        }, '.json');

    });
    encryptButton.classList.add('hidden');

    const decryptButton = addButton('enc-json', () => {

        // Convert an encrypted `.enc` file to a raw `.json` file and download
        uploadFile(async (file) => {
            const encryptedString = await file.text();
            const rawObject = await decryptStringToObject(encryptedString, cryptoKey);
            downloadJson(rawObject);
        }, '.enc');

    });
    decryptButton.classList.add('hidden');

    const defaultKeyButton = addButton('default-key', async () => {

        // Derive `CryptoKey` object from default values
        cryptoKey = await createKey(true);

        // Switch the visible button set
        defaultKeyButton.classList.add('hidden');
        customKeyButton.classList.add('hidden');
        encryptButton.classList.remove('hidden');
        decryptButton.classList.remove('hidden');

    });

    const customKeyButton = addButton('pbkdf2-key', async () => {

        // Derive `CryptoKey` object from custom user input
        cryptoKey = await createKey(false);

        // Switch the visible button set
        defaultKeyButton.classList.add('hidden');
        customKeyButton.classList.add('hidden');
        encryptButton.classList.remove('hidden');
        decryptButton.classList.remove('hidden');

    });

    // Show the page element
    queries.page.style.display = '';

});