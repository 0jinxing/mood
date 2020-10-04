const originFetch = window.fetch;

export type FetchCaptureType = 'FETCH_ERROR';

export type FetchCapture = {
  type: FetchCaptureType;
  data: {
    method: string;
    url: string;
    message: string;
  };
};

export type FetchCaptureWithTime = FetchCapture & {
  timestamp: number;
  delay?: number;
};

export type CaptureFetchHandler = (params: FetchCaptureWithTime) => void;

export function captureFetch(handler: CaptureFetchHandler) {
  const wrapperFetch: typeof fetch = async (
    input: RequestInfo,
    init: RequestInit = {}
  ) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = typeof input === 'string' ? init.method : input.method;

    try {
      const resp = await originFetch(input, init);
      return resp;
    } catch (ev) {
      handler({
        type: 'FETCH_ERROR',
        data: {
          url: url,
          method: (method || 'GET').toUpperCase(),
          message: ev?.message
        },
        timestamp: Date.now()
      });
      throw ev;
    }
  };
  Object.defineProperty(window, 'fetch', { value: wrapperFetch });
}
