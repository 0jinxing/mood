export function chunk<T>(array: T[], count: number) {
  if (count == null || count < 1) return [];
  const result = [];
  let i = 0;
  while (i < array.length) {
    result.push(array.slice(i, (i += count)));
  }
  return result;
}
