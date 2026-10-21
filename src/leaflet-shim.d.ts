declare module "leaflet" {
  interface LeafletNamespace {
    map: (...args: unknown[]) => unknown;
    [key: string]: unknown;
  }
  const L: LeafletNamespace;
  export default L;
}
