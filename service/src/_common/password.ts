import * as crypto from "crypto";

export function genSalt(len: number = 8) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString("hex");
}

export function hashPass(password: string, salt: string) {
  const hash = crypto.createHmac("sha512", salt);
  hash.update(password);
  return {
    salt,
    hash: hash.digest("hex"),
  };
}

export function verifyPass(password: string, hash: string, salt: string) {
  return hashPass(password, salt).hash === hash;
}
