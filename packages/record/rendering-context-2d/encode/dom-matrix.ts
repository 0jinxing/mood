import { NonFunctionKeys } from 'utility-types';

export const DOMMatrixProps: Exclude<NonFunctionKeys<DOMMatrix>, 'is2D' | 'isIdentity'>[] = [
  // 2D 👇
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',

  // 3D 👇
  'm11',
  'm12',
  'm13',
  'm14',
  'm21',
  'm22',
  'm23',
  'm24',
  'm31',
  'm32',
  'm33',
  'm34',
  'm41',
  'm42',
  'm43',
  'm44'
];

export type DOMMatrixSerialized = {
  constructor: 'DOMMatrix';
  props: Partial<Record<NonFunctionKeys<DOMMatrix>, DOMMatrix[NonFunctionKeys<DOMMatrix>]>>;
};

export function encodeDOMMatrix(matrix: DOMMatrix): DOMMatrixSerialized {
  const props: DOMMatrixSerialized['props'] = {};

  DOMMatrixProps.forEach(key => {
    props[key] = matrix[key];
  });

  return { constructor: 'DOMMatrix', props };
}

export const decodeDOMMatrix = (value: any) => {
  const matrix = new DOMMatrix();

  DOMMatrixProps.forEach(key => {
    matrix[key] = value.props[key];
  });

  return matrix;
};
