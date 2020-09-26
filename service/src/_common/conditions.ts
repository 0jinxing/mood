export function genQueryConditions(
  conditions: { [key: string]: any },
  ignore: string[] = []
) {
  return Object.keys(conditions)
    .filter(k => conditions[k] !== undefined)
    .reduce((pre, key) => {
      if (ignore.includes(key)) return pre;
      return { ...pre, [key]: conditions[key] };
    }, {});
}

export type QueryConditions<T> = Partial<T> & {
  skip?: number;
  limit?: number;
};
