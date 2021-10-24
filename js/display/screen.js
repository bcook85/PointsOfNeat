'use strict';

class Screen {
  constructor(canvas, fullScreen) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    // Stop default actions
    this.canvas.oncontextmenu = () => { return false; };
    this.canvas.onselectstart = () => { return false; };
    if (fullScreen) {
      // Automatically re-size game canvas
      window.addEventListener(
        "resize", () => { this.autoFullscreen(); }
        ,false
      );
      window.addEventListener(
        "orientationchange", () => { this.autoFullscreen(); }
        ,false
      );
      this.autoFullscreen();
    }
  };
  clear() {
    this.ctx.fillStyle = "rgb(0,0,0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  };
  autoFullscreen() {
    let newWidth = Math.floor(this.canvas.parentElement.clientWidth);
    let newHeight = Math.floor(window.innerHeight);
    let aspectRatio = this.canvas.width / this.canvas.height;
    if (newWidth / newHeight > aspectRatio) {//wide
      newWidth = Math.floor(newHeight * aspectRatio);
      this.canvas.style.height = newHeight + "px";
      this.canvas.style.width = newWidth + "px";
    }
    else {//tall
      newHeight = Math.floor(newWidth / aspectRatio);
      this.canvas.style.width = newWidth + "px";
      this.canvas.style.height = newHeight + "px";
    }
  };
  resetMouseWheel() {
    this.mouse.wheel = 0;
  };
  getSize() {
    return new Vector(this.canvas.width, this.canvas.height);
  };
};
