import { hookSetter } from '../utils';

export type XhrCallbackParams = {
  method: string;
  url: string;
  statusText?: string;
};

export type XhrCallback = (params: XhrCallbackParams) => void;

const xmlHttp = XMLHttpRequest;
const originOpen = xmlHttp.prototype.open;
const originSend = xmlHttp.prototype.send;

function initXhrObserver(cb: XhrCallback) {
  const dataMap = new WeakMap<XhrCallbackParams>();

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

export default initXhrObserver;
