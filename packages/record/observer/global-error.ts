import { IncrementalSource } from '../constant';

export type ErrorData = {
  source: IncrementalSource.GLOBAL_ERROR;
  message: string;
};

export type ErrorCb = (param: ErrorData) => void;

function errorObserve(cb: ErrorCb) {
  const errorHandler = (ev: ErrorEvent | PromiseRejectionEvent) => {
    if (ev instanceof ErrorEvent) {
      cb({ source: IncrementalSource.GLOBAL_ERROR, message: ev.message });
    }
    if (ev instanceof PromiseRejectionEvent) {
      cb({ source: IncrementalSource.GLOBAL_ERROR, message: ev.reason });
    }
  };

  window.addEventListener('error', errorHandler);
  window.addEventListener('unhandledrejection', errorHandler);

  return () => {
    window.removeEventListener('error', errorHandler);
    window.removeEventListener('unhandledrejection', errorHandler);
  };
}

export default errorObserve;
