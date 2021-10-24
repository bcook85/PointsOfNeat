'use strict';

class Mouse {
	constructor(canvasElement) {
		this.pos = new Vector(0, 0);
		this.buttonLeft = false;
		this.buttonRight = false;
    this.eDeltaY = 0;
		this.wheelDirection = 0;
    this.image = undefined;
		// Add Event Listeners
		canvasElement.addEventListener(
      "mousemove", (e) => {
        let canvasRect = canvasElement.getBoundingClientRect();
        let scaleX = canvasElement.width / canvasRect.width;
        let scaleY = canvasElement.height / canvasRect.height;
        this.pos.x = Math.min(Math.max(Math.floor((e.clientX - canvasRect.left) * scaleX), 0), canvasElement.width);
        this.pos.y = Math.min(Math.max(Math.floor((e.clientY - canvasRect.top) * scaleY), 0), canvasElement.height);
      },false
    );
    canvasElement.addEventListener(
      "mousedown", (e) => {
        e.preventDefault();
        if (e.button === 0) {
          this.buttonLeft = true;
        } else if (e.button === 2) {
          this.buttonRight = true;
        }
      },false
    );
    canvasElement.addEventListener(
      "mouseup", (e) => {
        e.preventDefault();
        if (e.button === 0) {
          this.buttonLeft = false;
        } else if (e.button === 2) {
          this.buttonRight = false;
        }
      },false
    );
    canvasElement.addEventListener(
      "wheel", (e) => {
        e.preventDefault();
        this.eDeltaY = e.deltaY;
      }, false
    );
	};
  render(ctx) {
    if (this.image != undefined) {
      ctx.drawImage(
        this.image
        ,0, 0
        ,this.image.width, this.image.height
        ,Math.floor(this.pos.x), Math.floor(this.pos.y)
        ,this.image.width, this.image.height
      );
    }
  };
  update() {
    this.wheelDirection = this.eDeltaY;
    this.eDeltaY = 0;
  };
  setMouseImage(image) {
    this.image = image;
  };
  reset() {
    this.buttonLeft = false;
    this.buttonRight = false;
    this.wheelDirection = 0;
  };
};
