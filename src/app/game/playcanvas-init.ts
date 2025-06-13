import { AppBase, AppOptions, Asset, AssetRegistry, GraphicsDevice } from 'playcanvas';

export class PlayCanvasInitializer {
  private app: any;
  private pc: any;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, pc: any) {
    console.log('PlayCanvasInitializer constructor called with canvas:', canvas);
    this.pc = pc;
    this.canvas = canvas;
    
    if (!canvas) {
      throw new Error('Canvas element is required for PlayCanvas initialization');
    }

    if (!pc.Application) {
      throw new Error('PlayCanvas Application class is not available');
    }
  }

  async initialize(): Promise<any> {
    console.log('Starting PlayCanvas initialization...');
    
    try {
      // Configure canvas
      console.log('Configuring canvas...');
      this.canvas.setAttribute('id', 'application-canvas');
      this.canvas.setAttribute('tabindex', '0');
      this.canvas.onselectstart = () => false;
      (this.canvas.style as any)['-webkit-user-select'] = 'none';
      console.log('Canvas configured successfully');

      // Create application directly
      console.log('Creating PlayCanvas Application...');
      this.app = new this.pc.Application(this.canvas, {
        mouse: new this.pc.Mouse(this.canvas),
        keyboard: new this.pc.Keyboard(window),
        touch: new this.pc.TouchDevice(this.canvas),
        gamepads: new this.pc.GamePads(),
        graphicsDeviceOptions: {
          deviceTypes: ['webgl2', 'webgl1'],
          powerPreference: 'high-performance',
          antialias: true
        }
      });

      // Enable script system
      this.pc.script.legacy = true;
      this.pc.script.createLoadingScreen = function(app: any) {};

      // Start the application
      this.app.start();
      console.log('PlayCanvas Application started successfully');

      // Set up asset handlers
      this.setupAssetHandlers();
      console.log('Asset handlers set up successfully');

      return this.app;
    } catch (err) {
      console.error('Error during PlayCanvas initialization:', err);
      throw err;
    }
  }

  private setupAssetHandlers() {
    const app = this.app;
    const pc = this.pc;

    // Texture handler
    app.assets.textureHandler = {
      load: function(url: string, callback: any) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
          try {
            const texture = new pc.Texture(app.graphicsDevice, {
              width: img.width,
              height: img.height,
              format: pc.PIXELFORMAT_R8_G8_B8_A8,
              mipmaps: true,
              minfilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
              magfilter: pc.FILTER_LINEAR,
              addressU: pc.ADDRESS_REPEAT,
              addressV: pc.ADDRESS_REPEAT
            });
            texture.setSource(img);
            callback(null, texture);
          } catch (err) {
            callback(err);
          }
        };
        
        img.onerror = function(err) {
          callback(new Error('Failed to load texture: ' + url));
        };
        
        img.src = url;
      },
      open: function(url: string, data: any) {
        return data;
      }
    };

    // Material handler
    app.assets.materialHandler = {
      load: function(url: string, callback: any) {
        try {
          const material = new pc.StandardMaterial();
          material.update();
          callback(null, material);
        } catch (err) {
          callback(err);
        }
      },
      open: function(url: string, data: any) {
        return data;
      }
    };

    // Model handler
    app.assets.modelHandler = {
      load: function(url: string, callback: any) {
        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(data => callback(null, data))
          .catch(err => callback(err));
      },
      open: function(url: string, data: any) {
        return data;
      }
    };

    // Container handler
    app.assets.containerHandler = {
      load: function(url: string, callback: any) {
        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(data => callback(null, data))
          .catch(err => callback(err));
      },
      open: function(url: string, data: any) {
        return data;
      }
    };

    // Audio handler
    app.assets.audioHandler = {
      load: function(url: string, callback: any) {
        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.arrayBuffer();
          })
          .then(data => callback(null, data))
          .catch(err => callback(err));
      },
      open: function(url: string, data: any) {
        return data;
      }
    };

    // Animation handler
    app.assets.animationHandler = {
      load: function(url: string, callback: any) {
        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(data => callback(null, data))
          .catch(err => callback(err));
      },
      open: function(url: string, data: any) {
        return data;
      }
    };

    // Cubemap handler
    app.assets.cubemapHandler = {
      load: function(url: string, callback: any) {
        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(data => callback(null, data))
          .catch(err => callback(err));
      },
      open: function(url: string, data: any) {
        return data;
      }
    };

    // HTML handler
    app.assets.htmlHandler = {
      load: function(url: string, callback: any) {
        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
          })
          .then(data => callback(null, data))
          .catch(err => callback(err));
      },
      open: function(url: string, data: any) {
        return data;
      }
    };

    // JSON handler
    app.assets.jsonHandler = {
      load: function(url: string, callback: any) {
        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(data => callback(null, data))
          .catch(err => callback(err));
      },
      open: function(url: string, data: any) {
        return data;
      }
    };

    // CSS handler
    app.assets.cssHandler = {
      load: function(url: string, callback: any) {
        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
          })
          .then(data => callback(null, data))
          .catch(err => callback(err));
      },
      open: function(url: string, data: any) {
        return data;
      }
    };
  }
} 