import { randomBytes } from "crypto";

const UIDCHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const genUID = (len: number = 8) =>
  new Promise<string>((resolve, reject) => {
    randomBytes(len, (err, buf) => {
      if (err) {
        return reject(err);
      }
      const str = [];
      let rand: number;
      for (let i = 0; i < buf.length; i++) {
        rand = buf[i];
        while (rand > 248) {
          try {
            rand = randomBytes(1)[0];
          } catch (err) {
            reject(err);
          }
        }
        str.push(UIDCHARS[rand % UIDCHARS.length]);
      }
      resolve(str.join(""));
    });
  });
