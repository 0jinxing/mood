export type XhrCbParam = {
  method: string;
  url: string;
  statusText?: string;
};

export type XhrCb = (param: XhrCbParam) => void;

const xmlHttp = XMLHttpRequest;
const originOpen = xmlHttp.prototype.open;
const originSend = xmlHttp.prototype.send;

function xhrObserve(cb: XhrCb) {
  const dataMap = new WeakMap<XhrCbParam>();

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
          cb({ method, url, statusText: req.statusText });
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
