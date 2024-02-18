export function queryViewport(doc: Document) {
  const width = doc.documentElement?.clientWidth || doc.body?.clientWidth;

  const height = doc.documentElement?.clientHeight || doc.body?.clientHeight;

  return { width, height };
}
