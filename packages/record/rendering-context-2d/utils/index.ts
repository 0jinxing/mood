export function constructorValidate(value: Object, constructor: Function) {
  if (value?.constructor === constructor) {
    return;
  }

  throw new Error(`Expected Encodeable<${constructor.name}>`);
}
