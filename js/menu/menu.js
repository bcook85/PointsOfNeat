'use strict';

class Menu {
  constructor(bgImage) {
    this.bgImage = bgImage;
    this.width = this.bgImage.width;
    this.height = this.bgImage.height;
    this.image = document.createElement("canvas");
    this.image.width = this.bgImage.width;
    this.image.height = this.bgImage.height;
    this.ctx = this.image.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    // Items
    this.textItems = [];
    this.imageButtons = [];
    this.radioButtons = [];
    this.toggleButtons = [];
  };
  render(ctx, pos) {
    // draw bg
    this.ctx.drawImage(
      this.bgImage
      ,0, 0
      ,this.bgImage.width, this.bgImage.height
      ,0 ,0
      ,this.image.width, this.image.height
    );
    // draw dynamic text
    for (let i = 0; i < this.textItems.length; i++) {
      this.textItems[i].render(this.ctx);
    }
    // Render ImageButtons
    for (let i = 0; i < this.imageButtons.length; i++) {
      this.imageButtons[i].render(this.ctx);
    }
    // Render RadioButtons
    for (let i = 0; i < this.radioButtons.length; i++) {
      this.radioButtons[i].render(this.ctx);
    }
    for (let i = 0; i < this.radioButtons.length; i++) {
      this.radioButtons[i].renderInteraction(this.ctx);
    }
    // Render ToggleButtons
    for (let i = 0; i < this.toggleButtons.length; i++) {
      this.toggleButtons[i].render(this.ctx);
    }
    for (let i = 0; i < this.toggleButtons.length; i++) {
      this.toggleButtons[i].renderInteraction(this.ctx);
    }
    // Draw to Screen
    ctx.drawImage(
      this.image
      ,0, 0
      ,this.image.width, this.image.height
      ,Math.floor(pos.x), Math.floor(pos.y)
      ,this.image.width, this.image.height
    );
  };
  update(mousePos, mouseLeftButton) {
    this.updateImageButtons(mousePos, mouseLeftButton);
    this.updateRadioButtons(mousePos, mouseLeftButton);
    this.updateToggleButtons(mousePos, mouseLeftButton);
  };
  updateImageButtons(mousePos, mouseLeftButton) {
    for (let i = 0; i < this.imageButtons.length; i++) {
      this.imageButtons[i].update(mousePos, mouseLeftButton);
    }
  };
  updateRadioButtons(mousePos, mouseLeftButton) {
    let clickedButton = -1;
    for (let i = 0; i < this.radioButtons.length; i++) {
      this.radioButtons[i].update(mousePos);
      if (mouseLeftButton) {
        if (this.radioButtons[i].click(mousePos)) {
          clickedButton = i;
        }
      }
    }
    if (clickedButton > -1) {
      for (let i = 0; i < this.radioButtons.length; i++) {
        if (i != clickedButton) {
          this.radioButtons[i].resetSelection();
        }
      }
    }
  };
  updateToggleButtons(mousePos, mouseLeftButton) {
    for (let i = 0; i < this.toggleButtons.length; i++) {
      this.toggleButtons[i].update(mousePos);
      if (mouseLeftButton) {
        this.toggleButtons[i].click(mousePos);
      }
    }
  };
};
