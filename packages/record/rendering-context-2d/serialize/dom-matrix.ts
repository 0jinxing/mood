import { NonFunctionKeys } from 'utility-types';

export const DOMMatrixProps: NonFunctionKeys<DOMMatrix>[] = [
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
  name: 'DOMMatrix';
  props: Partial<Record<NonFunctionKeys<DOMMatrix>, DOMMatrix[NonFunctionKeys<DOMMatrix>]>>;
};

export function serializeDOMMatrix(matrix: DOMMatrix): DOMMatrixSerialized {
  const props: DOMMatrixSerialized['props'] = {};

  DOMMatrixProps.forEach(key => {
    props[key] = matrix[key];
  });

  return {
    name: 'DOMMatrix',
    props
  };
}
