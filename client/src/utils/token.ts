class Token {
  private value: string = "";
  private timestamp: number = 0;
  private expires: number = 0;

  constructor(private key: string) {
    this.value = localStorage.getItem(`${key}`) ?? "";

    const timestamp = +(localStorage.getItem(`${key}_timestamp`) ?? "");
    this.timestamp = isNaN(timestamp) ? 0 : timestamp;

    const expires = +(localStorage.getItem(`${key}_expires`) ?? "");
    this.expires = isNaN(expires) ? 0 : expires;
  }

  public get() {
    if (this.timestamp + this.expires < Date.now()) {
      return this.value;
    }
    return this.value;
  }

  public set(val: string, expires: number) {
    localStorage.setItem(this.key, val);
    localStorage.setItem(`${this.key}_timestamp`, Date.now().toString());
    localStorage.setItem(`${this.key}_expires`, expires.toString());

    this.value = val;
    this.timestamp = Date.now();
    this.expires = expires;
  }
}

export default Token;