import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY env var must be a 64-character hex string (32 bytes)."
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypts a plaintext string. Returns a combined hex string:
 * iv (32 hex) + authTag (32 hex) + ciphertext (variable hex)
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();

  return iv.toString("hex") + tag.toString("hex") + encrypted;
}

/**
 * Decrypts a hex string produced by encrypt().
 */
export function decrypt(data: string): string {
  const key = getKey();
  const iv = Buffer.from(data.slice(0, IV_LENGTH * 2), "hex");
  const tag = Buffer.from(
    data.slice(IV_LENGTH * 2, IV_LENGTH * 2 + TAG_LENGTH * 2),
    "hex"
  );
  const ciphertext = data.slice(IV_LENGTH * 2 + TAG_LENGTH * 2);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/** Encrypt a JSON-serializable object. */
export function encryptJSON(obj: unknown): string {
  return encrypt(JSON.stringify(obj));
}

/** Decrypt back into a parsed object. */
export function decryptJSON<T = unknown>(data: string): T {
  return JSON.parse(decrypt(data)) as T;
}
