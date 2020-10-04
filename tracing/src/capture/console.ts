const originConsoleError = console.error.bind(console);
const originConsoleWarn = console.warn.bind(console);

export type ConsoleCaptureType = 'CONSOLE_ERROR' | 'CONSOLE_WARN';

export type ConsoleCapture = {
  type: ConsoleCaptureType;
  data: { args: unknown[] };
};

export type ConsoleCaptureWithTime = ConsoleCapture & {
  timestamp: number;
  delay?: number;
};

export type CaptureConsoleHandler = (params: ConsoleCaptureWithTime) => void;

export function captureConsole(handler: CaptureConsoleHandler) {
  Object.defineProperty(window.console, 'error', {
    value: (...args: unknown[]) => {
      originConsoleError(...args);
      handler({ type: 'CONSOLE_ERROR', data: { args }, timestamp: Date.now() });
    }
  });

  Object.defineProperty(window.console, 'warn', {
    value: (...args: unknown[]) => {
      originConsoleWarn(...args);
      handler({ type: 'CONSOLE_WARN', data: { args }, timestamp: Date.now() });
    }
  });
}
