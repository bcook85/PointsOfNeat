'use strict';

class StartState extends State {

  static PHASES = {
    "load": 0
    ,"play": 1
  };

  constructor(keyManager, mouse) {
    super();

    // Input
    this.keys = keyManager;
    this.mouse = mouse;

    // Menu
    this.menuOffset = new Vector(24, 24);
    this.menu = undefined;
  };
  init() {
    this.initMenu();
  };
  render(ctx) {
    this.menu.render(ctx, this.menuOffset);
  };
  update() {
    this.menu.update(this.mouse.pos.sub(this.menuOffset), this.mouse.buttonLeft);
  };
  initMenu() {
    this.menu = new Menu(AssetManager.assets.cSpriteStart.cutImage(0, 0, 1232, 672));

    // New Sim
    this.menu.imageButtons.push(new ImageButton(
      AssetManager.assets.cSpriteStart.cutImage(0, 672, 124, 24)
      ,AssetManager.assets.cSpriteStart.cutImage(124, 672, 124, 24)
      ,new Vector(Math.floor((this.menu.width - 124) * 0.5), 496)
      ,() => {
        this.mouse.reset();
        StateManager.setState(StateManager.states.game);
      }
    ));

    // Load Sim
    this.menu.imageButtons.push(new ImageButton(
      AssetManager.assets.cSpriteStart.cutImage(248, 672, 141, 24)
      ,AssetManager.assets.cSpriteStart.cutImage(389, 672, 141, 24)
      ,new Vector(Math.floor((this.menu.width - 141) * 0.5), 544)
      ,() => {
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";
        fileInput.onchange = () => {
          let fr = new FileReader();
          fr.readAsText(fileInput.files[0], "UTF-8");
          fr.onload = (evt) => {
            GameState.FILE_DATA = evt.target.result;
            StateManager.setState(StateManager.states.game);
          };
        };
        fileInput.click();
        this.mouse.reset();
      }
    ));

    // Edit Map
    this.menu.imageButtons.push(new ImageButton(
      AssetManager.assets.cSpriteStart.cutImage(530, 672, 142, 24)
      ,AssetManager.assets.cSpriteStart.cutImage(672, 672, 142, 24)
      ,new Vector(Math.floor((this.menu.width - 142) * 0.5), 592)
      ,() => {
        this.mouse.reset();
        StateManager.setState(StateManager.states.editor);
      }
    ));
  };
};
