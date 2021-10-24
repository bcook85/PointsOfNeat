'use strict';

class SpriteSheetGrid {
  constructor(file, frameWidth, frameHeight) {
    this.file = file;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.framesX = 0;
    this.framesY = 0;
    this.images = [];
    this.loaded = false;
    // Load image, separate into frames
    let tempImage = new Image();
    tempImage.sheet = this;
    tempImage.onload = function() {
      console.log(`Image Loaded: ${file}`);
      this.sheet.framesX = Math.floor(this.width / this.sheet.frameWidth);
      this.sheet.framesY = Math.floor(this.height / this.sheet.frameHeight);
      for (let y = 0; y < this.sheet.framesY; y++) {
        for (let x = 0; x < this.sheet.framesX; x++) {
          let tempCanvas = document.createElement("canvas");
          tempCanvas.width = this.sheet.frameWidth;
          tempCanvas.height = this.sheet.frameHeight;
          let tempCtx = tempCanvas.getContext("2d");
          tempCtx.imageSmoothingEnabled = false;
          tempCtx.drawImage(
            this
            ,x * this.sheet.frameWidth, y * this.sheet.frameHeight
            ,this.sheet.frameWidth,this.sheet.frameHeight
            ,0,0
            ,tempCanvas.width,tempCanvas.height
          );
          this.sheet.images.push(tempCanvas);
        }
      }
      this.sheet.loaded = true;
    };
    tempImage.src = file;
  };
  getImage(id) {
    if (id >= 0 && id < this.images.length) {
      return this.images[id];
    }
    return undefined;
  };
};
