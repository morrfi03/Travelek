interface Window {
  [key: string]: any;
}
interface HTMLElement {
  [key: string]: any;
}
interface Element {
  [key: string]: any;
}
interface EventTarget {
  [key: string]: any;
}
interface Document {
  getElementById(elementId: string): any;
}
interface HTMLCanvasElement {
  getContext(contextId: "2d", options?: CanvasRenderingContext2DSettings): CanvasRenderingContext2D | null;
  getContext(contextId: "webgl" | "experimental-webgl", options?: WebGLContextAttributes): WebGLRenderingContext | null;
  getContext(contextId: string, options?: any): any;
}

declare var countryAt: any;
declare var regionIn: any;
declare var scheduleGlobe: any;
declare var globeCv: any;
declare var globeProjection: any;
declare var globeRot: any;
declare var globeScale: any;
declare var globeFit: any;
declare var globeZoom: any;
