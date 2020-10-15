import { IncrementalSource } from '../constant';

export type XhrData = {
  source: IncrementalSource.REQUEST_XHR;
  method: string;
  url: string;
  statusText?: string;
};

export type XhrCb = (param: XhrData) => void;

const xmlHttp = XMLHttpRequest;
const originOpen = xmlHttp.prototype.open;
const originSend = xmlHttp.prototype.send;

function xhrObserve(cb: XhrCb) {
  const dataMap = new WeakMap<XhrData>();

  xmlHttp.prototype.open = function (
    method: string,
    url: string,
    isAsync?: boolean,
    username?: string | null,
    password?: string | null
  ) {
    dataMap.set(this, { method, url });
    return originOpen.call(this, method, url, isAsync, username, password);
  };

  xmlHttp.prototype.send = function (body?: Document | BodyInit | null) {
    let req: XMLHttpRequest;
    const data = dataMap.get(this);

    if (this instanceof XMLHttpRequest && data) {
      req = this as XMLHttpRequest;
      const { method, url } = data;

      req.addEventListener('readystatechange', () => {
        if (req.readyState === 4) {
          cb({
            source: IncrementalSource.REQUEST_XHR,
            method,
            url,
            statusText: req.statusText
          });
        }
      });
    }
    return originSend.call(this, body);
  };

  return () => {
    xmlHttp.prototype.open = originOpen;
    xmlHttp.prototype.send = originSend;
  };
}

export default xhrObserve;
