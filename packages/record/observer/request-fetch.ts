import { IncrementalSource } from '../constant';
import { plain } from '../utils';

export type FetchData = {
  source: IncrementalSource.REQUEST_FETCH;
  input: unknown;
  init?: unknown;
  error?: unknown;
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
        cb({
          source: IncrementalSource.REQUEST_FETCH,
          error: plain(error),
          input: plain(input),
          init: plain(init)
        })
      );
    }
  };

  return () => {
    window.fetch = originFetch;
  };
}

export default fetchObserve;
