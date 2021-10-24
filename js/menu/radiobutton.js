'use strict';

class RadioButton {
  constructor(image, hoverColor, pos, callback) {
    this.image = image;
    this.hoverColor = hoverColor;
    this.pos = pos;
    this.isHovered = false;
    this.isSelected = false;
    this.isClicked = false;
    this.callback = callback;
  };
  render(ctx) {
    ctx.drawImage(
      this.image
      ,0, 0
      ,this.image.width, this.image.height
      ,this.pos.x, this.pos.y
      ,this.image.width, this.image.height
    );
  };
  renderInteraction(ctx) {
    if (this.isHovered || this.isSelected) {
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = this.hoverColor;
      ctx.rect(
        Math.floor(this.pos.x)
        ,Math.floor(this.pos.y)
        ,Math.floor(this.image.width)
        ,Math.floor(this.image.height)
      );
      ctx.stroke();
    }
  };
  update(mousePos) {
    if (mousePos.x >= this.pos.x && mousePos.x <= this.pos.x + this.image.width
      && mousePos.y >= this.pos.y && mousePos.y <= this.pos.y + this.image.height) {
      this.isHovered = true;
    } else {
      this.isHovered = false;
    }
    this.isClicked = false;
  };
  click(mousePos) {
    if (mousePos.x >= this.pos.x && mousePos.x <= this.pos.x + this.image.width
      && mousePos.y >= this.pos.y && mousePos.y <= this.pos.y + this.image.height
      && !this.isSelected) {
      this.callback();
      this.isSelected = true;
      this.isClicked = false;
      return true;
    }
    return false;
  };
  resetSelection() {
    this.isSelected = false;
  };
};
