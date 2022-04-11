function toString(value: unknown) {
  if (typeof value === 'object' || typeof value === 'function') {
    return Object.prototype.toString.call(value);
  }
  return value + '';
}

export function stringify(target: unknown): string {
  if (Array.isArray(target)) {
    const values = target.map(toString).join('\n\t');
    return `[\n\t${values}\n]`;
  }

  if (target && typeof target === 'object') {
    const kv = Object.entries(target)
      .map(([name, value]) => `${name}:${toString(value)}`)
      .join('\n\t');
    return `{\n\t${kv}\n}`;
  }

  return toString(target);
}
