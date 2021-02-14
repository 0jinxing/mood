export type ImageDataPlain = {
  kind: 'imageData';
  extra: {
    data: number[];
    height: number;
    width: number;
  };
};

export function extendImageData() {
  return () => {};
}
