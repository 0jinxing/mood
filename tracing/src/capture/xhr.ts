const xmlHttp = window.XMLHttpRequest;

const originSend = xmlHttp.prototype.send;
const originOpen = xmlHttp.prototype.open;

export type XhrCaptureType = 'XHR_ERROR' | 'XHR_TIMEOUT' | 'XHR_ABORT';

export type XhrCapture = {
  type: XhrCaptureType;
  data: { url: string; method: string };
};

export type XhrCaptureWithTime = XhrCapture & {
  timestamp: number;
  delay?: number;
};

export type CaptureXhrHandler = (params: XhrCaptureWithTime) => void;

export function captureXhr(handler: CaptureXhrHandler) {
  const dataMap = new WeakMap<object, { method: string; url: string }>();

  xmlHttp.prototype.open = function (
    method: string,
    url: string,
    isAsync?: boolean,
    username?: string | null,
    password?: string | null
  ) {
    dataMap.set(this, { method, url });
    originOpen.call(this, method, url, isAsync, username, password);
  };

  xmlHttp.prototype.send = function (body?: Document | BodyInit | null) {
    originSend.call(this, body);

    let req: XMLHttpRequest;
    const data = dataMap.get(this);

    if (this instanceof XMLHttpRequest && data) {
      req = this as XMLHttpRequest;
      const { url, method } = data;

      const wrapperHandler = (type: XhrCaptureType) => {
        handler({ type, data: { method, url }, timestamp: Date.now() });
      };

      req.addEventListener('error', () => {
        wrapperHandler('XHR_ERROR');
      });

      req.addEventListener('timeout', () => {
        wrapperHandler('XHR_TIMEOUT');
      });

      req.addEventListener('abort', () => {
        wrapperHandler('XHR_ABORT');
      });
    }
  };
}
