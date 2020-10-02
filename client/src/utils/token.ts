export class Storage {
  getItem(key: string): string {
    return sessionStorage.getItem(key) || localStorage.getItem(key) || '';
  }

  setItem(key: string, val: string, expires: number = 0) {
    this.clear(key);

    if (expires) {
      localStorage.setItem(key, val);
    } else {
      sessionStorage.setItem(key, val);
    }
  }

  clear(key: string) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

class Token {
  private storage: Storage;

  constructor(private key: string) {
    const storage = new Storage();
    this.storage = storage;
  }

  public get() {
    return this.storage.getItem(this.key);
  }

  public set(val: string, expires: number = 0) {
    this.storage.setItem(this.key, val, expires);
  }

  public clear() {
    this.storage.clear(this.key);
  }
}

export default Token;
