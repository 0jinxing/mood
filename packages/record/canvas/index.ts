import { mirror } from '@mood/snapshot';

import { hookFunc, hookSetter } from '../utils';
import { extendPath2D } from './path2d';
import { extendCanvasGradient } from './canvas-gradient';
import { getExtraData, setExtraData } from 'packages/snapshot/utils/extra';
import { restore, RestoreType } from '../utils/canvas';

export const METHOD_KEYS = <const>[
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

export const CREATE_KEYS = <const>[
  'createPattern',
  'createLinearGradient',
  'createRadialGradient'
];

export const PROPS = <const>[
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

type Context2DMethod = typeof METHOD_KEYS[number];
type Context2DProp = typeof PROPS[number];

export type CanvasParam = {
  canvasId: number;
  key: Context2DMethod | Context2DProp;

  args?: RestoreType[];

  value?: RestoreType;
};

export type CanvasCallback = (param: CanvasParam) => void;

export function canvas(cb: CanvasCallback) {
  const prototype = CanvasRenderingContext2D.prototype;

  const extendUnsubscribes = [extendPath2D(), extendCanvasGradient()];

  const methodUnsubscribes = METHOD_KEYS.map(key =>
    hookFunc(prototype, key, function (_: unknown, args: any[]) {
      const self: CanvasRenderingContext2D = this;
      const canvasId = mirror.getId(self.canvas);
      cb({
        canvasId,
        key,
        args: args.map(item => {
          if (typeof item !== 'object' || !item) return item;
          if (item instanceof HTMLElement) {
            return { sn: mirror.getId(item) };
          }
          return getExtraData(item) ?? item;
        })
      });
    })
  );

  const propsUnsubscribes = PROPS.map(key =>
    hookSetter(prototype, key, function (value) {
      const self: CanvasRenderingContext2D = this;
      const canvasId = mirror.getId(self.canvas);

      cb({ canvasId, key, value: restore(value) ?? value });
    })
  );

  const createUnsubscribes = CREATE_KEYS.map(key =>
    hookFunc(
      prototype,
      key,
      function (result: CanvasGradient | CanvasPattern, args: number[]) {
        const self: CanvasRenderingContext2D = this;
        const canvasId = mirror.getId(self.canvas);

        if (result instanceof CanvasPattern) {
          setExtraData(result, {
            impl: 'pattern',
            restore: { canvasId, create: args }
          });
        } else if (result instanceof CanvasGradient) {
          setExtraData(result, {
            impl:
              key === 'createLinearGradient'
                ? 'linearGradient'
                : 'radialGradient',
            restore: { canvasId, create: args, stop: [] }
          });
        }
      }
    )
  );

  return () => {
    [
      ...extendUnsubscribes,
      ...methodUnsubscribes,
      ...propsUnsubscribes,
      ...createUnsubscribes
    ].forEach(u => u());
  };
}
