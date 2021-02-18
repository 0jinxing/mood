import { mirror } from '@mood/snapshot';

import { hookMethod, hookProp } from '../utils';
import { extendPath2D } from './path2d';
import {
  CanvasGradientAddition,
  extendCanvasGradient
} from './canvas-gradient';
import { getAddition, setAddition } from '@mood/snapshot/utils/addition';
import { RestoreType } from '../utils/canvas';
import { CanvasPatternAddition } from './canvas-pattern';
import { MethodKeys, PropKeys } from '../types';

type C2DMethod = MethodKeys<CanvasRenderingContext2D>;
type C2DProp = PropKeys<CanvasRenderingContext2D>;

export const METHOD_KEYS: ReadonlyArray<C2DMethod> = [
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

export const CREATE_KEYS: ReadonlyArray<C2DMethod> = [
  'createPattern',
  'createLinearGradient',
  'createRadialGradient'
];

export const PROPS: ReadonlyArray<C2DProp> = [
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

export type CanvasParam = {
  canvasId: number;
  key: C2DMethod | C2DProp;
  args?: RestoreType[];
  value?: RestoreType;
};

export type CanvasCallback = (param: CanvasParam) => void;

export function canvas(cb: CanvasCallback) {
  const prototype = CanvasRenderingContext2D.prototype;

  const extendUnsubscribes = [extendPath2D(), extendCanvasGradient()];

  const methodUnsubscribes = METHOD_KEYS.map(key =>
    hookMethod(prototype, key, function (_, args) {
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
          return getAddition(item) ?? item;
        })
      });
    })
  );

  const propsUnsubscribes = PROPS.map(key =>
    hookProp(prototype, key, function (value) {
      const self: CanvasRenderingContext2D = this;
      const canvasId = mirror.getId(self.canvas);

      cb({ canvasId, key, value: getAddition(value) ?? value });
    })
  );

  const createUnsubscribes: Function[] = [];

  createUnsubscribes.push(
    hookMethod(
      prototype,
      'createPattern',
      function (result, [source, repetition]) {
        const self: CanvasRenderingContext2D = this;
        if (source instanceof HTMLElement) {
          setAddition<CanvasPatternAddition>(result, {
            kind: 'pattern',
            base: [mirror.getId(self.canvas), mirror.getId(source), repetition]
          });
        }
      }
    )
  );

  createUnsubscribes.push(
    hookMethod(
      prototype,
      'createLinearGradient',
      function (
        result: CanvasGradient,
        x0: number,
        y0: number,
        x1: number,
        y1: number
      ) {
        const self: CanvasRenderingContext2D = this;
        setAddition<CanvasGradientAddition>(result, {
          kind: 'linear',
          base: [mirror.getId(self.canvas), x0, y0, x1, y1, []]
        });
      }
    )
  );

  createUnsubscribes.push(
    hookMethod(
      prototype,
      'createRadialGradient',
      function (
        result: CanvasGradient,
        x0: number,
        y0: number,
        r0: number,
        x1: number,
        y1: number,
        r1: number
      ) {
        const self: CanvasRenderingContext2D = this;
        setAddition<CanvasGradientAddition>(result, {
          kind: 'radial',
          base: [mirror.getId(self.canvas), x0, y0, r0, x1, y1, r1, []]
        });
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
