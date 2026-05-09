import { randomBytes, timingSafeEqual, pbkdf2Sync } from "node:crypto";

const iterations = 210_000;
const keyLength = 32;
const digest = "sha256";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString(
    "hex"
  );

  return `pbkdf2:${iterations}:${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string | null) {
  if (!passwordHash) {
    return false;
  }

  const [algorithm, iterationValue, salt, storedHash] = passwordHash.split(":");

  if (algorithm !== "pbkdf2" || !iterationValue || !salt || !storedHash) {
    return false;
  }

  const hash = pbkdf2Sync(
    password,
    salt,
    Number(iterationValue),
    keyLength,
    digest
  );
  const stored = Buffer.from(storedHash, "hex");

  if (hash.length !== stored.length) {
    return false;
  }

  return timingSafeEqual(hash, stored);
}
