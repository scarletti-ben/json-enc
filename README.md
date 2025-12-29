# Overview
Uses `JavaScript`'s built-in [`Web Crypto API`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) to generate a key that can be used encrypt and decrypt user files. If a user uploads a raw `.json` file, the file will be encrypted using the current key before being downloaded as an encrypted `.enc` file. Conversely, if a user uploads an encrypted `.enc` file, the file will be decrypted using the current key before being downloaded as a raw `.json` file.

By default the module `encryptor.js` uses `PBKDF2` / `SHA-256` / `AES-GCM` with 100,000 iterations.

# Project Metadata
```yaml
---
title: "json-enc"
date: "2025-12-26T16-08"
description: ""
categories: [
  webdev
]
tags: [
  html, css, javascript, encryption, decryption, .json, .enc, username, password, salt, initialization vector, initialisation vector, iv, pbkdf2, sha-256, aes-gcm, base64
]
---
```