'use strict';

class LoadState extends State {

  constructor(screenSize, keyManager, mouse) {
    super(screenSize, keyManager, mouse);
  };
  init() {
    // N/A
  };
  render(ctx) {
    // Display Loading Message
    ctx.font = "96px Monospace";
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.textAlign = "center";
    ctx.fillText(
      "Loading..."
      ,Math.floor(this.screenSize.x * 0.5)
      ,Math.floor(this.screenSize.y * 0.5)
    );
  };
  update() {
    if (AssetManager.isReady()) {
      StateManager.setState(StateManager.states.start);
    }
  };
};
