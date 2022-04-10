const URL_MATCH = /url\(["']?(.*?)["']?\)/gi;

let $anchor: HTMLAnchorElement;
export function rDoc(value: string) {
  $anchor = $anchor || document.createElement('a');
  $anchor.href = value;
  return $anchor.href;
}

export function rStyle(cssText: string) {
  return cssText.replace(URL_MATCH, (origin: string, filePath: string) => {
    if (!filePath) return origin;
    return `url(${rDoc(filePath)})`;
  });
}

export function rSrcset(value: string) {
  if (!/\S+/.test(value)) return '';

  return value
    .split(',')
    .map(val => {
      const [url, size = ''] = val.trim().split(/\s+/);
      return `${rDoc(url)} ${size}`.trim();
    })
    .join(', ');
}

const hMap: Record<string, undefined | ((v: string) => string)> = {
  src: rDoc,
  href: rDoc,
  srcset: rSrcset,
  style: rStyle
};

export function rAttr(name: string, value: string) {
  const h = hMap[name];
  return h ? h(value) : value;
}
