import type { GradienPayload } from './subscribe/canvas2d/gradient';
import { Path2DPlayload } from './subscribe/canvas2d/path2d';
import { PatternPlayload } from './subscribe/canvas2d/pattern';

declare global {
  interface CanvasGradient {
    __p?: GradienPayload;
  }
  interface CanvasPattern {
    __p?: PatternPlayload;
  }
  interface Path2D {
    __p?: Path2DPlayload;
  }
}
