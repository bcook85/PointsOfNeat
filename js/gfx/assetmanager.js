'use strict';

class AssetManager {

  static screenSize = new Vector(0,0);
  static assets = {};

  static init(screenSizeVector) {
    AssetManager.screenSize = new Vector(screenSizeVector.x, screenSizeVector.y);
    // Define Assets
    AssetManager.assets = {
      "cSpriteStart": new SpriteSheetCustom("res/images/start.png")
      ,"gSpriteTiles": new SpriteSheetGrid("res/images/tiles.png", 32, 32)
      ,"cSpriteEditor": new SpriteSheetCustom("res/images/editor.png")
      ,"gSpriteEntities": new SpriteSheetGrid("res/images/entities.png", 32, 32)
      ,"cSpriteGame": new SpriteSheetCustom("res/images/game.png")
      ,"gSpriteFont": new SpriteSheetGrid("res/images/font.png", 16, 16)
    };
  };
  
  static isReady() {
    for (let asset in AssetManager.assets) {
      if (Object.prototype.hasOwnProperty.call(AssetManager.assets, asset)) {
        if (!AssetManager.assets[asset].loaded) {
          return false;
        }
      }
    }
    return true;
  };
};
