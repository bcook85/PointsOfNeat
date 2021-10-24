'use strict';

class Font {
  static CHARACTERS = {
    "A": 0
    ,"B": 1
    ,"C": 2
    ,"D": 3
    ,"E": 4
    ,"F": 5
    ,"G": 6
    ,"H": 7
    ,"I": 8
    ,"J": 9
    ,"K": 10
    ,"L": 11
    ,"M": 12
    ,"N": 13
    ,"O": 14
    ,"P": 15
    ,"Q": 16
    ,"R": 17
    ,"S": 18
    ,"T": 19
    ,"U": 20
    ,"V": 21
    ,"W": 22
    ,"X": 23
    ,"Y": 24
    ,"Z": 25
    ,"0": 26
    ,"1": 27
    ,"2": 28
    ,"3": 29
    ,"4": 30
    ,"5": 31
    ,"6": 32
    ,"7": 33
    ,"8": 34
    ,"9": 35
    ,".": 36
    ,",": 37
    ,"!": 38
    ,"-": 39
    ,":": 40
    ," ": 41
    ,"?": 42
    ,"'": 43
    ,"\"": 44
    ,"_": 45
    ,"+": 46
    ,"/": 47
  };
  static SPACING = 1;
  static getPotentialWidth(text, characterSize) {
    return (text.length * characterSize.x) + text.length - 1;
  };
  static createImage(text, characterSize, fontSpriteSheetGrid) {
    let image = document.createElement("canvas");
    image.width = (text.length * characterSize.x) + text.length - 1;
    image.height = characterSize.y;
    let ctx = image.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    // Text
    for (let i = 0; i < text.length; i++) {
      let char = Font.CHARACTERS[text[i]];
      if (char !== undefined) {
        let aCharacter = fontSpriteSheetGrid.images[char];
        ctx.drawImage(
          aCharacter
          ,0,0,fontSpriteSheetGrid.frameWidth,fontSpriteSheetGrid.frameHeight
          ,(i * characterSize.x) + (i * Font.SPACING)
          ,0
          ,characterSize.x
          ,characterSize.y
        );
      }
    }
    return image;
  };
};