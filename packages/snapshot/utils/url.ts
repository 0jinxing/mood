const URL_MATCH = /url\(["']?(.*?)["']?\)/gi;

export function absToDoc(value: string): string {
  const { href } = new URL(value, location.origin);
  return href;
}

export function absToStyle(cssText: string) {
  return cssText.replace(URL_MATCH, (origin: string, filePath: string) => {
    if (!filePath) return origin;
    return `url(${absToDoc(filePath)})`;
  });
}

export function absToSrcset(value: string) {
  if (!/\S+/.test(value)) return '';

  return value
    .split(',')
    .map(val => {
      const [url, size = ''] = val.trim().split(/\s+/);
      return `${absToDoc(url)} ${size}`.trim();
    })
    .join(', ');
}

export function abs(name: string, value: string) {
  if (name === 'src' || name === 'href') {
    return absToDoc(value);
  }
  if (name === 'srcset') {
    return absToSrcset(value);
  }
  if (name === 'style') {
    return absToStyle(value);
  }
  return value;
}
