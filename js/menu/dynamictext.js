'use strict';

class DynamicText {
  constructor(pos, size) {
    this.pos = pos;
    this.size = size;
    this.image = document.createElement("canvas");
    this.image.width = size.x;
    this.image.height = size.y;
    this.ctx = this.image.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.text = "";
  };
  render(ctx) {
    ctx.drawImage(
      this.image
      ,0, 0
      ,this.image.width, this.image.height
      ,Math.floor(this.pos.x)
      ,Math.floor(this.pos.y)
      ,this.image.width, this.image.height
    );
  };
  update(newText, fontSheet) {
    if (newText != this.text) {
      this.text = newText.toString()
      if (this.text.length == 1) {
        this.text = [this.text];
      }
      let textImage = Font.createImage(this.text, new Vector(16, 16), fontSheet);
      this.ctx.clearRect(0, 0, this.image.width, this.image.height);
      this.ctx.drawImage(
        textImage
        ,0 ,0
        ,textImage.width, textImage.height
        ,Math.floor((this.image.width * 0.5) - (textImage.width / 2)), 0
        ,textImage.width, textImage.height
      );
    }
  };
};
