'use strict';

class SpriteSheetCustom {
  constructor(file) {
    this.file = file;
    this.fullImage = new Image();
    this.loaded = false;
    // Load image
    this.fullImage.sheet = this;
    this.fullImage.onload = function() {
      this.sheet.loaded = true;
      console.log(`Image Loaded: ${this.sheet.file}`);
    };
    this.fullImage.src = file;
  };
  cutImage(x, y, width, height) {
    let tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    let tempCtx = tempCanvas.getContext("2d");
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.drawImage(
      this.fullImage
      ,x, y
      ,width,height
      ,0,0
      ,tempCanvas.width,tempCanvas.height
    );
    return tempCanvas;
  };
};
