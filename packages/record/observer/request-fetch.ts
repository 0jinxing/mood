import { IncrementalSource } from '../constant';
export type FetchData = {
  source: IncrementalSource.REQUEST_FETCH;
  input: RequestInfo;
  init?: RequestInit;
  error: Error | null;
};

export type FetchCb = (param: FetchData) => void;

const originFetch = fetch;

function fetchObserve(cb: FetchCb) {
  window.fetch = async (input: RequestInfo, init?: RequestInit) => {
    let error: Error | null = null;
    try {
      const resp = await originFetch(input, init);
      return resp;
    } catch (err) {
      error = err;
      throw err;
    } finally {
      setTimeout(() =>
        cb({ source: IncrementalSource.REQUEST_FETCH, input, init, error })
      );
    }
  };

  return () => {
    window.fetch = originFetch;
  };
}

export default fetchObserve;
