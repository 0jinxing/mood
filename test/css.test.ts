import { expect } from 'chai';
import { pseudoToClass } from '@mood/snapshot';

it('pseudoToClass', () => {
  let result = '';

  result = pseudoToClass('a:hover{color:red}', ':hover');
  expect(result).eq('a.:hover{color:red}');

  result = pseudoToClass('div a:hover{color:red}', ':hover');
  expect(result).eq('div a.:hover{color:red}');

  result = pseudoToClass('div {color: red} div,div > a:hover{color:red}', ':hover');
  expect(result).eq('div > a.:hover{color:red}');

  result = pseudoToClass('', ':hover');
  expect(result).eq('');
});
