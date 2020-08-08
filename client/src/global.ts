declare module '*.svg' {
  const value: any;
  export default value;
}

declare module '*.scss' {
  const value: Record<string, string>;
  export default value;
}
