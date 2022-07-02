const URL_MATCH = /url\(["']?(.*?)["']?\)/gi;

let $anchor: HTMLAnchorElement;
export function resolveBaseUrl(value: string) {
  $anchor = $anchor || document.createElement('a');
  $anchor.href = value;
  return $anchor.href;
}

export function resolveStyleUrl(cssText: string) {
  return cssText.replace(URL_MATCH, (origin: string, filePath: string) => {
    if (!filePath) return origin;
    return `url(${resolveBaseUrl(filePath)})`;
  });
}

export function resolveSrcsetUrl(value: string) {
  if (!/\S+/.test(value)) return '';

  return value
    .split(',')
    .map(val => {
      const [url, size = ''] = val.trim().split(/\s+/);
      return `${resolveBaseUrl(url)} ${size}`.trim();
    })
    .join(', ');
}

const resolveMap: Record<string, undefined | ((v: string) => string)> = {
  src: resolveBaseUrl,
  href: resolveBaseUrl,
  srcset: resolveSrcsetUrl,
  style: resolveStyleUrl
};

export function resolveAttrUrl(name: string, value: string) {
  const h = resolveMap[name];
  return h ? h(value) : value;
}
