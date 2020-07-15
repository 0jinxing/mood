import * as crypto from "crypto";

export function hashPassword(password: string, salt: string) {
  const hash = crypto.createHmac("sha512", salt);
  hash.update(password);
  return hash.digest("hex");
}

export function validatePassword(password: string, hash: string, salt: string) {
  return hashPassword(password, salt) === hash;
}
