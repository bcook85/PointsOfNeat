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
    // States
    StateManager.init(this.screen.getSize(), this.keyManager, this.mouse);
  };
  start() {
    // Initialize Loop Variables
    this.now = performance.now();
    this.elapsed = 0;
    this.last = this.now;
    // Begin Load
    this.animationFrameId = window.requestAnimationFrame( () => this.loop() );
  };
  stop() {
    window.cancelAnimationFrame(this.animationFrameId);
  };
  timing() {
    this.now = performance.now();
    this.elapsed = this.now - this.last;
    this.last = this.now;
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
