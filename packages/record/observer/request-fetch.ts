import { hookSetter } from '../utils';

export type FetchCbParam = {
  input: RequestInfo;
  init?: RequestInit;
  error: Error | null;
};

export type FetchCb = (param: FetchCbParam) => void;

const originFetch = fetch;

function fetchObserve(cb: FetchCb) {
  return hookSetter(window, 'fetch', {
    get() {
      return async (input: RequestInfo, init?: RequestInit) => {
        let error: Error | null = null;
        try {
          const resp = await originFetch(input, init);
          return resp;
        } catch (err) {
          error = err;
          throw err;
        } finally {
          setTimeout(() => cb({ input, init, error }));
        }
      };
    }
  });
}

export default fetchObserve;
