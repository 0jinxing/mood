
const URL_MATCH = /url\(["']?(.*?)["']?\)/gi;

let baseUrl = '';
export function absoluteToDoc(attrValue: string): string {
  if (!baseUrl) {
    const $anchor = document.createElement('a');
    $anchor.href = '/';
    baseUrl = $anchor.href;
  }
  const { href } = new URL(attrValue, baseUrl);
  return href;
}

export function absoluteToStylesheet(cssText: string) {
  return cssText.replace(URL_MATCH, (origin: string, filePath: string) => {
    if (!filePath) return origin;
    return `url(${absoluteToDoc(filePath)})`;
  });
}

export function absoluteToSrcsetAttr(attrValue: string) {
  const splitValueArr = attrValue.split(',');
  const resultingSrcsetString = splitValueArr
    .map(val => {
      const [url, size = ''] = val.trim().split(/\s+/);
      return `${absoluteToDoc(url)} ${size}`.trim();
    })
    .join(',');

  return resultingSrcsetString;
}

// relative url => absolute url
export function transformAttr(attrName: string, attrValue: string) {
  if (attrName === 'src' || attrName === 'href') {
    return absoluteToDoc(attrValue);
  } else if (attrName === 'srcset') {
    return absoluteToSrcsetAttr(attrValue);
  } else if (attrName === 'style') {
    return absoluteToStylesheet(attrValue);
  }
  return attrValue;
}
