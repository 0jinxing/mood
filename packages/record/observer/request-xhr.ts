import { hookSetter } from '../utils';

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

  const openHandler = hookSetter(xmlHttp.prototype, 'open', {
    get() {
      return function (
        method: string,
        url: string,
        isAsync?: boolean,
        username?: string | null,
        password?: string | null
      ) {
        dataMap.set(this, { method, url });
        return originOpen.call(this, method, url, isAsync, username, password);
      };
    }
  });

  const sendHandler = hookSetter(xmlHttp.prototype, 'send', {
    get() {
      return function (body?: Document | BodyInit | null) {
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
    }
  });

  return () => {
    openHandler();
    sendHandler();
  };
}

export default xhrObserve;
