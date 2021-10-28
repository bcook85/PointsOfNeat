'use strict';

class AssetManager {
  
  static isReady() {
    for (let asset in AssetManager) {
      if (Object.prototype.hasOwnProperty.call(AssetManager, asset)) {
        if (!AssetManager[asset].loaded) {
          return false;
        }
      }
    }
    return true;
  };

  // Define Assets
  static cSpriteStart = new SpriteSheetCustom("res/images/start.png");
  static gSpriteTiles = new SpriteSheetGrid("res/images/tiles.png", 32, 32);
  static cSpriteEditor = new SpriteSheetCustom("res/images/editor.png");
  static gSpriteEntities = new SpriteSheetGrid("res/images/entities.png", 32, 32);
  static cSpriteGame = new SpriteSheetCustom("res/images/game.png");
  static gSpriteFont = new SpriteSheetGrid("res/images/font.png", 16, 16);
};
