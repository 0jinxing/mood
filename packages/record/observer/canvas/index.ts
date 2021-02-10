import { isPlain } from '../../is';
import { Plain } from '../../types';
import { mirror } from '@mood/snapshot';
import { hookFunc, hookSetter } from '../../utils';

// https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D
type Ctx2DMethod =
  | 'arc'
  | 'arcTo'
  | 'beginPath'
  | 'bezierCurveTo'
  | 'clearRect'
  | 'clip' // pick Path2D
  | 'closePath'
  | 'drawImage' // pick HTMLImageElement
  | 'ellipse'
  | 'fill' // pick Path2D
  | 'fillRect'
  | 'fillText'
  | 'lineTo'
  | 'moveTo'
  | 'putImageData' // pick ImageData
  | 'quadraticCurveTo'
  | 'rect'
  | 'resetTransform'
  | 'restore'
  | 'rotate'
  | 'save'
  | 'scale'
  | 'setLineDash'
  | 'setTransform'
  | 'stroke' // pick Path2D
  | 'strokeRect'
  | 'strokeText'
  | 'transform'
  | 'translate';

type Ctx2DProp =
  | 'direction'
  | 'fillStyle' // pick CanvasGradient CanvasPattern
  | 'filter'
  | 'font'
  | 'globalAlpha'
  | 'globalCompositeOperation'
  | 'imageSmoothingEnabled'
  | 'imageSmoothingQuality'
  | 'lineCap'
  | 'lineDashOffset'
  | 'lineJoin'
  | 'lineWidth'
  | 'miterLimit'
  | 'shadowBlur'
  | 'shadowColor'
  | 'shadowOffsetX'
  | 'shadowOffsetY'
  | 'strokeStyle'
  | 'textAlign'
  | 'textBaseline';

const methods: Ctx2DMethod[] = [
  'arc',
  'arcTo',
  'beginPath',
  'bezierCurveTo',
  'clearRect',
  'clip', // pick Path2D
  'closePath',
  'drawImage', // pick HTMLImageElement
  'ellipse',
  'fill', // pick Path2D
  'fillRect',
  'fillText',
  'lineTo',
  'moveTo',
  'putImageData', // pick ImageData
  'quadraticCurveTo',
  'rect',
  'resetTransform',
  'restore',
  'rotate',
  'save',
  'scale',
  'setLineDash',
  'setTransform',
  'stroke', // pick Path2D
  'strokeRect',
  'strokeText',
  'transform',
  'translate'
];

type CtxCreateMethod =
  | 'createLinearGradient'
  | 'createRadialGradient'
  | 'createPattern';

const createMethods: CtxCreateMethod[] = [
  'createPattern',
  'createLinearGradient',
  'createRadialGradient'
];

const props: Ctx2DProp[] = [
  'direction',
  'fillStyle', // pick CanvasGradient CanvasPattern
  'filter',
  'font',
  'globalAlpha',
  'globalCompositeOperation',
  'imageSmoothingEnabled',
  'imageSmoothingQuality',
  'lineCap',
  'lineDashOffset',
  'lineJoin',
  'lineWidth',
  'miterLimit',
  'shadowBlur',
  'shadowColor',
  'shadowOffsetX',
  'shadowOffsetY',
  'strokeStyle',
  'textAlign',
  'textBaseline'
];

export type CanvasData = {
  canvasId: number;
  key: Ctx2DMethod | Ctx2DProp;
  args?: unknown[];
  value?: unknown | Plain<unknown>;
};

export type CanvasCb = (param: CanvasData) => void;

function canvas(cb: CanvasCb) {
  const prototype = CanvasRenderingContext2D.prototype;

  const methodUnsubscribes = methods.map(key =>
    hookFunc(prototype, key, function (_: unknown, ...args: any[]) {
      const self: CanvasRenderingContext2D = this;
      const canvasId = mirror.getId(self.canvas);
      cb({
        canvasId,
        key,
        args: args.map(item => (isPlain(item) ? item.$plain!() : item))
      });
    })
  );

  const propsUnsubscribes = props.map(key =>
    hookSetter(prototype, key, function (value) {
      const self: CanvasRenderingContext2D = this;
      const canvasId = mirror.getId(self.canvas);

      cb({ canvasId, key, value: isPlain(value) ? value.$plain!() : value });
    })
  );

  const createUnsubscribes = createMethods.map(key =>
    hookFunc(
      prototype,
      key,
      function (result: CanvasGradient | CanvasPattern, ...args: number[]) {
        const self: CanvasRenderingContext2D = this;
        const canvasId = mirror.getId(self.canvas);

        if (result instanceof CanvasPattern) {
          result.$plainData = {
            impl: 'pattern',
            restore: { canvasId, create: args }
          };
        } else if (result instanceof CanvasGradient) {
          result.$plainData = {
            impl:
              key === 'createLinearGradient'
                ? 'linearGradient'
                : 'radialGradient',
            restore: {
              canvasId,
              create: args,
              stop: []
            }
          };
        }
      }
    )
  );

  return () => {
    methodUnsubscribes.forEach(u => u());

    propsUnsubscribes.forEach(u => u());

    createUnsubscribes.forEach(u => u());
  };
}
