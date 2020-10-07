export type ErrorCallbackParams = {
  message: string;
};

export type ErrorCallback = (params: ErrorCallbackParams) => void;

function initErrorObserver(cb: ErrorCallback) {
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

export default initErrorObserver;
