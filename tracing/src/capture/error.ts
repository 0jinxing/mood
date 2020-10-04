export type ErrorCaptureType = 'UNHANDLED_REJECTION' | 'GLOBAL_ERROR';

export type ErrorCapture = {
  type: ErrorCaptureType;
  data: { message: string };
};

export type ErrorCaptureWithTime = ErrorCapture & { timestamp: number };

export type CaptureErrorHandler = (params: ErrorCaptureWithTime) => void;

export function captureError(handler: CaptureErrorHandler) {
  window.addEventListener('error', ev => {
    handler({
      type: 'GLOBAL_ERROR',
      data: { message: ev.message },
      timestamp: Date.now()
    });
  });

  window.addEventListener('unhandledrejection', ev => {
    handler({
      type: 'UNHANDLED_REJECTION',
      data: ev.reason,
      timestamp: Date.now()
    });
  });
}
