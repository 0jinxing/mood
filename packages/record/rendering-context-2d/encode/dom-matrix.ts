import { NonFunctionKeys } from 'utility-types';
import { constructorValidate } from '../utils';

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

export type DOMMatrixEncoded = {
  constructor: 'DOMMatrix';
  props: Partial<Record<(typeof DOMMatrixProps)[number], number>>;
};

export function isDOMMatrixEncoded(value: any): value is DOMMatrixEncoded {
  return value && value.constructor === 'DOMMatrix';
}

export function encodeDOMMatrix(matrix: DOMMatrix): DOMMatrixEncoded {
  constructorValidate(matrix, DOMMatrix);

  const props: DOMMatrixEncoded['props'] = {};

  DOMMatrixProps.forEach(key => {
    props[key] = matrix[key];
  });

  return { constructor: 'DOMMatrix', props };
}

export const decodeDOMMatrix = (encoded: DOMMatrixEncoded) => {
  const matrix = new DOMMatrix();

  DOMMatrixProps.forEach(key => {
    matrix[key] = encoded.props[key] || matrix[key];
  });

  return matrix;
};
