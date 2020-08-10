class Token {
  private value: string = '';
  private timestamp: number = 0;
  private expires: number = 0;

  constructor(private key: string) {
    this.value = localStorage.getItem(`${key}`) ?? '';

    const timestamp = +(localStorage.getItem(`${key}_timestamp`) ?? '');
    this.timestamp = isNaN(timestamp) ? 0 : timestamp;

    const expires = +(localStorage.getItem(`${key}_expires`) ?? '');
    this.expires = isNaN(expires) ? 0 : expires;
  }

  public get() {
    if (this.expires === 0) {
      return this.value;
    } else if (this.timestamp + this.expires < Date.now()) {
      return '';
    }
    return this.value;
  }

  public set(val: string, expires: number = 0) {
    if (expires) {
      localStorage.setItem(this.key, val);
      localStorage.setItem(`${this.key}_timestamp`, Date.now().toString());
      localStorage.setItem(`${this.key}_expires`, expires.toString());
    } else {
      localStorage.removeItem(this.key);
      localStorage.removeItem(`${this.key}_timestamp`);
      localStorage.removeItem(`${this.key}_expires`);
    }

    this.timestamp = Date.now();
    this.expires = expires;
    this.value = val;
  }
}

export default Token;
