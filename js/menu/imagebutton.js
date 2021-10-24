'use strict';

class ImageButton {
  constructor(image, hoverImage, pos, callback) {
    this.image = image;
    this.hoverImage = hoverImage;
    this.pos = pos;
    this.isHovered = false;
    this.isClicked = false;
    this.callback = callback;
  };
  render(ctx) {
    if (this.isHovered) {
      ctx.drawImage(
        this.hoverImage
        ,0, 0
        ,this.hoverImage.width, this.hoverImage.height
        ,this.pos.x, this.pos.y
        ,this.hoverImage.width, this.hoverImage.height
      );
    } else {
      ctx.drawImage(
        this.image
        ,0, 0
        ,this.image.width, this.image.height
        ,this.pos.x, this.pos.y
        ,this.image.width, this.image.height
      );
    }
  };
  update(mousePos, mouseLeftButton) { // mousePos needs to be mouse.pos.sub(menuPosition)
    this.isHovered = false;
    this.isClicked = false;
    if (mousePos.x >= this.pos.x && mousePos.x <= this.pos.x + this.image.width
      && mousePos.y >= this.pos.y && mousePos.y <= this.pos.y + this.image.height) {
      this.isHovered = true;
      if (mouseLeftButton) {
        this.clicked = true;
        this.callback();
      }
    }
  };
};
