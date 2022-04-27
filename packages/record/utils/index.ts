export function queryViewport() {
  const width = self.innerWidth;
  const height = self.innerHeight;

  return { width, height };
}
