// AES-256-GCM helpers for BYOK at-rest encryption (PLANNING.md §8 / §9).
// Plaintext API keys never leave the server in this path.

import { gcm } from "@noble/ciphers/aes";
import { randomBytes } from "@noble/ciphers/webcrypto";
import { sha256 } from "@noble/hashes/sha2";

const utf8 = new TextEncoder();
const decoder = new TextDecoder();

function getKey(): Uint8Array {
  const b64 = process.env.BYOK_ENCRYPTION_KEY;
  if (!b64 || b64.startsWith("CHANGE_ME")) {
    throw new Error(
      "BYOK_ENCRYPTION_KEY missing. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
    );
  }
  const buf = Buffer.from(b64, "base64");
  if (buf.length !== 32) {
    throw new Error(`BYOK_ENCRYPTION_KEY must decode to 32 bytes (got ${buf.length}).`);
  }
  return new Uint8Array(buf);
}

export interface EncryptedSecret {
  ciphertext: Buffer;
  iv: Buffer;
  keyVersion: number;
}

export function encryptSecret(plaintext: string): EncryptedSecret {
  const key = getKey();
  const iv = randomBytes(12); // 96-bit nonce, GCM standard
  const aead = gcm(key, iv);
  const ct = aead.encrypt(utf8.encode(plaintext));
  return {
    ciphertext: Buffer.from(ct),
    iv: Buffer.from(iv),
    keyVersion: Number(process.env.BYOK_KEY_VERSION ?? "1"),
  };
}

export function decryptSecret(ciphertext: Uint8Array, iv: Uint8Array, _keyVersion?: number): string {
  const key = getKey();
  const aead = gcm(key, iv);
  const pt = aead.decrypt(ciphertext);
  return decoder.decode(pt);
}

export function sha256Hex(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? utf8.encode(input) : input;
  return Buffer.from(sha256(bytes)).toString("hex");
}

// URL-safe random token for overlay URLs. 32 bytes → 43 chars unpadded base64url.
export function generateOverlayToken(): string {
  return Buffer.from(randomBytes(32))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function hashIp(ip: string): string {
  const salt = process.env.AUDIT_IP_SALT ?? "rotate-me-monthly";
  return sha256Hex(`${salt}:${ip}`).slice(0, 32);
}
