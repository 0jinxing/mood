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

const hookMethods: Ctx2DMethod[] = [
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

const hookProps: Ctx2DProp[] = [
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

function canvas() {
  const prototype = CanvasRenderingContext2D.prototype;
  hookMethods.map(key =>
    hookFunc(prototype, key, function (_: unknown, ...args: any[]) {
      const self: CanvasRenderingContext2D = this;
      // cb
    })
  );

  hookProps.map(key =>
    hookSetter(prototype, key, function (val) {
      // cb
    })
  );

  createMethods.map(key =>
    hookFunc(prototype, key, function (result: unknown, ...args: any[]) {
      // cb
    })
  );
}
