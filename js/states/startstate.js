'use strict';

class StartState extends State {

  static PHASES = {
    "load": 0
    ,"play": 1
  };

  constructor(screenSize, keyManager, mouse) {
    super();

    // Display
    this.screenSize = screenSize;

    // Sprites
    this.menuSprites = new SpriteSheetCustom("res/images/start.png");

    // Input
    this.keys = keyManager;
    this.mouse = mouse;

    // Phase Control
    this.currentPhase = EditorState.PHASES.load;

    // Menu
    this.menuOffset = new Vector(24, 24);
    this.menu = undefined;
  };
  render(ctx) {
    switch(this.currentPhase) {
      case StartState.PHASES.load:
        this.renderLoad(ctx);
        break;
      case StartState.PHASES.play:
        this.renderPlay(ctx);
        break;
    }
  };
  renderLoad(ctx) {
    ctx.font = "64px Monospace";
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.textAlign = "center";
    ctx.fillText(
      "Loading..."
      ,Math.floor(this.screenSize.x * 0.5)
      ,Math.floor(this.screenSize.y * 0.5)
    );
  };
  renderPlay(ctx) {
    this.menu.render(ctx, this.menuOffset);
  };
  update() {
    switch(this.currentPhase) {
      case StartState.PHASES.load:
        this.updateLoad();
        break;
      case StartState.PHASES.play:
        this.updatePlay();
        break;
    }
  };
  assetsLoaded() {
    if (!this.menuSprites.loaded) {
      return false;
    }
    return true;
  };
  updateLoad() {
    if (this.assetsLoaded()) {
      this.initMenu();
      this.currentPhase = StartState.PHASES.play;
    }
  };
  updatePlay() {
    this.menu.update(this.mouse.pos.sub(this.menuOffset), this.mouse.buttonLeft);
  };
  initMenu() {
    this.menu = new Menu(this.menuSprites.cutImage(0, 0, 1232, 672));

    // New Sim
    this.menu.imageButtons.push(new ImageButton(
      this.menuSprites.cutImage(0, 672, 124, 24)
      ,this.menuSprites.cutImage(124, 672, 124, 24)
      ,new Vector(Math.floor((this.menu.width - 124) * 0.5), 496)
      ,() => {
        this.currentPhase = StartState.PHASES.load;
        this.mouse.reset();
        StateManager.setState("game");
      }
    ));

    // Load Sim
    this.menu.imageButtons.push(new ImageButton(
      this.menuSprites.cutImage(248, 672, 141, 24)
      ,this.menuSprites.cutImage(389, 672, 141, 24)
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
            this.currentPhase = StartState.PHASES.load;
            StateManager.setState("game");
          };
        };
        fileInput.click();
        this.mouse.reset();
      }
    ));

    // Edit Map
    this.menu.imageButtons.push(new ImageButton(
      this.menuSprites.cutImage(530, 672, 142, 24)
      ,this.menuSprites.cutImage(672, 672, 142, 24)
      ,new Vector(Math.floor((this.menu.width - 142) * 0.5), 592)
      ,() => {
        this.currentPhase = StartState.PHASES.load;
        this.mouse.reset();
        StateManager.setState("edit");
      }
    ));
  };
};
