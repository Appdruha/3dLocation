declare module 'playcanvas' {
  export class Application extends AppBase {
    constructor(canvas: HTMLCanvasElement);
  }

  export class AppBase {
    constructor(canvas: HTMLCanvasElement);
    canvas: HTMLCanvasElement;
    assets: AssetRegistry;
    graphicsDevice: GraphicsDevice;
    scene: any;
    scenes: any;
    init(options: AppOptions): void;
    start(): void;
  }

  export class AppOptions {
    graphicsDevice: GraphicsDevice;
    componentSystems: any[];
  }

  export class Asset {
    constructor(name: string, type: string, url: string | { url: string, filename: string }, data?: any);
    name: string;
    type: string;
    url: string;
    data: any;
    on(event: string, callback: (err?: any, data?: any) => void): void;
  }

  export class AssetRegistry {
    add(asset: Asset): void;
    load(asset: Asset): void;
    textureHandler: any;
    materialHandler: any;
    modelHandler: any;
    containerHandler: any;
    audioHandler: any;
    animationHandler: any;
    cubemapHandler: any;
    htmlHandler: any;
    jsonHandler: any;
    cssHandler: any;
  }

  export class GraphicsDevice {
    constructor(canvas: HTMLCanvasElement, options: any);
  }

  export class Texture {
    constructor(device: GraphicsDevice, options: any);
    setSource(source: HTMLImageElement): void;
  }

  export class StandardMaterial {
    constructor();
    update(): void;
  }

  export namespace pc {
    export const script: {
      legacy: boolean;
      createLoadingScreen: (app: any) => void;
      create: (name: string, code: string) => void;
    };

    export const createGraphicsDevice: (canvas: HTMLCanvasElement, options: any) => Promise<GraphicsDevice>;

    export const PIXELFORMAT_R8_G8_B8_A8: number;
    export const FILTER_LINEAR_MIPMAP_LINEAR: number;
    export const FILTER_LINEAR: number;
    export const ADDRESS_REPEAT: number;

    export const RigidBodyComponentSystem: any;
    export const CollisionComponentSystem: any;
    export const JointComponentSystem: any;
    export const AnimationComponentSystem: any;
    export const AnimComponentSystem: any;
    export const ModelComponentSystem: any;
    export const RenderComponentSystem: any;
    export const CameraComponentSystem: any;
    export const LightComponentSystem: any;
  }
} 