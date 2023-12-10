import { hookMethod } from '@mood/utils';
import { NonFunctionKeys, FunctionKeys } from 'utility-types';
import { serializeArgs } from './serialize';

export const CanvasRenderingContext2DMethods: FunctionKeys<CanvasRenderingContext2D>[] = [
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
  'clip',
  'closePath',
  'createConicGradient',
  'createImageData',
  'createLinearGradient',
  'createPattern',
  'createRadialGradient',
  'drawFocusIfNeeded',
  'drawImage',
  'ellipse',
  'fill',
  'fillRect',
  'fillText',
  // 'getContextAttributes',
  // 'getImageData',
  // 'getLineDash',
  // 'getTransform',
  // 'isContextLost',
  // 'isPointInPath',
  // 'isPointInStroke',
  'lineTo',
  // 'measureText',
  'moveTo',
  'putImageData',
  'quadraticCurveTo',
  'rect',
  'reset',
  'resetTransform',
  'restore',
  'rotate',
  'roundRect',
  'save',
  'scale',
  // 'scrollPathIntoView',
  'setLineDash',
  'setTransform',
  'stroke',
  'strokeRect',
  'strokeText',
  'transform',
  'translate'
];

export const CanvasRenderingContext2DProperties: NonFunctionKeys<CanvasRenderingContext2D>[] = [
  // 'canvas',
  'direction',
  'fillStyle',
  'filter',
  'font',
  'fontKerning',
  // 'fontStretch',
  // 'fontVariantCaps',
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
  // 'textRendering',
  // 'wordSpacing'
];

export function subscribeToRenderingContext2D(cb: Function) {
  CanvasRenderingContext2DMethods.map(key => {
    return hookMethod(CanvasRenderingContext2D.prototype, key, (...args: unknown[]) => {
      const values = serializeArgs(args);
      cb({ type: '2d', method: key, args: values });
    });
  });
}
