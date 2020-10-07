export type ErrorCbParam = {
  message: string;
};

export type ErrorCb = (param: ErrorCbParam) => void;

function errorObserve(cb: ErrorCb) {
  const errorHandler = (ev: ErrorEvent | PromiseRejectionEvent) => {
    if (ev instanceof ErrorEvent) {
      cb({ message: ev.message });
    }
    if (ev instanceof PromiseRejectionEvent) {
      cb({ message: ev.reason });
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
