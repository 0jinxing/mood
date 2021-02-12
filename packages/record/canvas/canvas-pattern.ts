export type CanvasPatternPlain = {
  kind: 'pattern';
  extra: {
    canvasId: number;
    create: [sourceId: number, repetition: string | null];
  };
};
