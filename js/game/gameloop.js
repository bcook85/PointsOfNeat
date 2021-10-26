'use strict';

class GameLoop {

  constructor(canvasElement, fullScreen) {
    // Loop Timing
    this.animationFrameId = 0;
    this.now = 0;
    this.last = 0;
    this.elapsed = 0;
    // Display
    this.screen = new Screen(canvasElement, fullScreen);
    // Input
    this.keyManager = new KeyManager();
    this.mouse = new Mouse(canvasElement);
    // Assets
    AssetManager.init(this.screen.getSize());
    // States
    StateManager.init(this.keyManager, this.mouse);
  };
  start() {
    // Begin Load
    this.animationFrameId = window.requestAnimationFrame( () => this.load() );
  };
  stop() {
    window.cancelAnimationFrame(this.animationFrameId);
  };
  timing() {
    this.now = performance.now();
    this.elapsed = this.now - this.last;
    this.last = this.now;
  };
  load() {
    if (AssetManager.isReady()) {
      // Start State
      StateManager.setInitialState();
      // Initialize Loop Variables
      this.now = performance.now();
      this.elapsed = 0;
      this.last = this.now;
      // Begin Loop
      this.animationFrameId = window.requestAnimationFrame( () => this.loop() );
    } else {
      // Continue Load
      this.animationFrameId = window.requestAnimationFrame( () => this.load() );
      // Display Loading Message
      this.screen.ctx.font = "96px Monospace";
      this.screen.ctx.fillStyle = "rgb(255,0,0)";
      this.screen.ctx.textAlign = "center";
      this.screen.ctx.fillText(
        "Loading..."
        ,Math.floor(this.screen.canvas.width * 0.5)
        ,Math.floor(this.screen.canvas.height * 0.5)
      );
    }
  };
  loop() {
    // Request Next Frame
    this.animationFrameId = window.requestAnimationFrame( () => this.loop() );
    // Update
    this.update();
    // Render
    this.render();
  };
  render() {
    this.screen.clear();
    // Render Current State
    StateManager.getState().render(this.screen.ctx);
  };
  update() {
    // Update Timing Variables
    this.timing();
    // Update Mouse
    this.mouse.update();
    // Update Current State
    StateManager.getState().update(this.elapsed);
  };
};
