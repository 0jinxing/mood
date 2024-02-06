import { Decodeable, decode, encode } from '@mood/rendering-context';
import { FunctionKeys, NonFunctionKeys } from 'utility-types';
import { hookMethod, hookProp, throttle } from '@mood/utils';
import { mirror } from '@mood/snapshot';
import { SourceTypes } from '../types';

export const RenderingContext2DMethods: FunctionKeys<CanvasRenderingContext2D>[] = [
  // arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: number);
  'arc',
  // arcTo(x1: number, y1: number, x2: number, y2: number, radius: number);
  'arcTo',
  // beginPath();
  'beginPath',
  /** bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number); */
  'bezierCurveTo',
  // clearRect(x: number, y: number, width: number, height: number);
  'clearRect',
  // clip();
  // clip(fillRule: 'nonzero' | 'evenodd');
  // clip(path: Path2D, fillRule: 'nonzero' | 'evenodd');
  'clip',
  // closePath();
  'closePath',
  'createConicGradient',
  'createImageData',
  'createLinearGradient',
  'createPattern',
  'createRadialGradient',
  // drawFocusIfNeeded(element: HTMLElement);
  // drawFocusIfNeeded(path: Path2D, element: HTMLElement);
  'drawFocusIfNeeded',
  // drawImage(image: HTMLOrSVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame, dx: number, dy: number);
  // drawImage(image: HTMLOrSVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame, dx: number, dy: number, dWidth: number, dHeight: number);
  // drawImage(image: HTMLOrSVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame, sx: number, sy: number, sWidth: number, sHeight: number, dx: number, dy: number, dWidth: number, dHeight: number);
  'drawImage',
  // ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: number);
  'ellipse',
  // fill();
  // fill(fillRule: 'nonzero' | 'evenodd');
  // fill(path: Path2D, fillRule: 'nonzero' | 'evenodd');
  'fill',
  // fillRect(x: number, y: number, width: number, height: number);
  'fillRect',
  // fillText(text: string, x: number, y: number)
  // fillText(text: string, x: number, y: number, maxWidth?: number)
  'fillText',
  // 'getContextAttributes',
  // 'getImageData',
  // 'getLineDash',
  // 'getTransform',
  // 'isContextLost',
  // 'isPointInPath',
  // 'isPointInStroke',
  // lineTo(x: number, y: number)
  'lineTo',
  // 'measureText',
  // moveTo(x: number, y: number)
  'moveTo',
  // putImageData(imageData: ImageData, dx: number, dy: number)
  // putImageData(imageData: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number)
  'putImageData',
  // quadraticCurveTo(cpx: number, cpy: number, x: number, y: number);
  'quadraticCurveTo',
  // rect(x: number, y: number, width: number, height: number);
  'rect',
  // reset()
  'reset',
  // resetTransform()
  'resetTransform',
  // restore()
  'restore',
  // rotate(angle: number)
  'rotate',
  // roundRect(x: number, y: number, width: number, height: number, radii: number | number[])
  'roundRect',
  // save()
  'save',
  // scale(x: number, y: number)
  'scale',
  // 'scrollPathIntoView',
  // setLineDash(segments: number[])
  'setLineDash',
  // setTransform(a: number, b: number, c: number, d: number, e: number, f: number)
  // setTransform(matrix: DOMMatrix)
  'setTransform',
  // stroke()
  // stroke(path: Path2D)
  'stroke',
  // strokeRect(x: number, y: number, width: number, height: number)
  'strokeRect',
  // strokeText(text: string, x: number, y: number)
  // strokeText(text: string, x: number, y: number, maxWidth?: number)
  'strokeText',
  // transform(a: number, b: number, c: number, d: number, e: number, f: number)
  'transform',
  // translate(x: number, y: number)
  'translate'
];

export const RenderingContext2DProperties: NonFunctionKeys<CanvasRenderingContext2D>[] = [
  // 'canvas',
  // direction = "ltr" || "rtl" || "inherit";
  'direction',
  // fillStyle = color;
  // fillStyle = gradient;
  // fillStyle = pattern;
  'fillStyle',
  // filter = "<filter-function1> [<filter-function2] [<filter-functionN]"; <DOMString>
  // filter = "none"; <DOMString>
  'filter',
  // string
  'font',
  // <"auto" | "normal" | "none">;
  'fontKerning',
  // 'fontStretch',
  // 'fontVariantCaps',
  // <number>
  'globalAlpha',
  // <"source-over" | "source-in" | "source-out" | "source-atop" | "destination-over" | "destination-in" | "destination-out" | "destination-atop" | "lighter" | "copy" | "xor" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity">
  'globalCompositeOperation',
  // <boolean>
  'imageSmoothingEnabled',
  // <"low" | "medium" | "high">
  'imageSmoothingQuality',
  // "butt" | "round" | "square"
  'lineCap',
  // number
  'lineDashOffset',
  // "bevel" | "round" | "miter"
  'lineJoin',
  // 描述线段宽度的数字。0、负数、 Infinity 和 NaN 会被忽略。
  // number
  'lineWidth',
  // 斜接面限制比例的的数字。0、负数、Infinity 和 NaN 都会被忽略。
  // number
  'miterLimit',
  // 描述模糊效果程度的，float 类型的值。默认值是 0。负数、 Infinity 或者 NaN 都会被忽略。
  // number
  'shadowBlur',
  // string
  'shadowColor',
  // 阴影水平偏移距离的 float 类型的值。默认值是 0。 Infinity 或者NaN都会被忽略。
  // number
  'shadowOffsetX',
  // 阴影垂直偏移距离的 float 类型的值。默认值是 0。 Infinity 或者NaN 都会被忽略。
  // number
  'shadowOffsetY',
  // string | CanvasGradient | CanvasPattern
  'strokeStyle',
  // "left" | "right" | "center" | "start" | "end"
  'textAlign',
  // "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom"
  'textBaseline'
  // 'textRendering',
  // 'wordSpacing'
];

export type SubscribeToCanvas2DArg = {
  id: number;
  source: SourceTypes.CANVAS;
  ops: Array<{
    key: FunctionKeys<CanvasRenderingContext2D> | NonFunctionKeys<CanvasRenderingContext2D>;
    value: Decodeable;
  }>;
};

export type SubscribeToCanvas2DHandler = (arg: SubscribeToCanvas2DArg) => void;

export function $$canvas2D(cb: SubscribeToCanvas2DHandler) {
  const store = new WeakMap<CanvasRenderingContext2D, SubscribeToCanvas2DArg['ops']>();

  const maybeEmit = throttle(async (context: CanvasRenderingContext2D) => {
    const id = mirror.getId(context.canvas);
    const ops = store.get(context);

    const width = context.canvas.width;
    const height = context.canvas.height;

    const start =
      ops?.findIndex(o => {
        if (o.key !== 'clearRect') return false;

        const [x, y, w, h] = decode(o.value as Parameters<typeof decode>) as Parameters<
          typeof CanvasRenderingContext2D.prototype.clearRect
        >;
        return x <= 0 && y <= 0 && w >= width && h >= height;
      }) || 0;

    if (ops?.length && id && start < ops.length) {
      cb({ id, source: SourceTypes.CANVAS, ops: ops.slice(start) });
      store.delete(context);
    }
  }, 40);

  const unsubscribes = [
    RenderingContext2DMethods.map(key =>
      hookMethod(
        CanvasRenderingContext2D.prototype,
        key,
        async function (_: unknown, ...args: unknown[]) {
          const context = this as CanvasRenderingContext2D;
          const ops = store.get(context) || [];
          try {
            ops.push({ key: key, value: encode(args as Parameters<typeof encode>) });
            store.set(context, ops);
            maybeEmit(context);
          } catch {}
        }
      )
    ),

    RenderingContext2DProperties.map(key =>
      hookProp(CanvasRenderingContext2D.prototype, key, function (value: unknown) {
        const context = this as CanvasRenderingContext2D;
        const ops = store.get(context) || [];
        try {
          ops.push({ key: key, value: encode(value as Parameters<typeof encode>) });
          store.set(context, ops);
          maybeEmit(context);
        } catch {}
      })
    )
  ].flat();

  return () => unsubscribes.forEach(fn => fn());
}
