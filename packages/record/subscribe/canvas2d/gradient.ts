import { hookMethod } from '@mood/utils';

export enum CreateGradientEnum {
  createLinearGradient,
  createRadialGradient,
  createConicGradient
}

type LinearGradientConstructor = [
  CreateGradientEnum.createLinearGradient,
  ...Parameters<typeof CanvasRenderingContext2D.prototype.createLinearGradient>
];

type RadialGradientConstructor = [
  CreateGradientEnum.createRadialGradient,
  ...Parameters<typeof CanvasRenderingContext2D.prototype.createRadialGradient>
];

type ConicGradientConstructor = [
  CreateGradientEnum.createConicGradient,
  ...Parameters<typeof CanvasRenderingContext2D.prototype.createConicGradient>
];

type GradientConstructor =
  | LinearGradientConstructor
  | RadialGradientConstructor
  | ConicGradientConstructor;

export type GradienPayload = {
  init: GradientConstructor;
  stops: Array<{ offset: number; color: string }>;
};

const GRADIENT_LIST = <const>[
  [CreateGradientEnum.createLinearGradient, 'createLinearGradient'],
  [CreateGradientEnum.createRadialGradient, 'createRadialGradient'],
  [CreateGradientEnum.createConicGradient, 'createConicGradient']
];

export function hocGradien() {
  const addColorStop = CanvasGradient.prototype.addColorStop;
  const restoreAddColorStop = hookMethod(
    CanvasGradient.prototype,
    'addColorStop',

    <typeof addColorStop>function (offset, color) {
      addColorStop.call(this, offset, color);
      (<CanvasGradient>this).__p?.stops.push({ offset, color });
    }
  );

  const gradientCreateUnsubscribes = GRADIENT_LIST.map(([t, key]) => {
    const raw = CanvasRenderingContext2D.prototype[key];
    return hookMethod(
      CanvasRenderingContext2D.prototype,
      key,
      function (...args: Parameters<typeof raw>) {
        const gradient: CanvasGradient = raw.apply(this, args);
        gradient.__p = [t, ...args] as unknown as GradienPayload;
      }
    );
  });

  return () => {
    restoreAddColorStop();
    gradientCreateUnsubscribes.forEach(h => h());
  };
}
