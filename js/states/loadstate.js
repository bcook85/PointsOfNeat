'use strict';

class LoadState extends State {

  constructor(keyManager, mouse) {
    super(keyManager, mouse);
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
      ,Math.floor(AssetManager.screenSize.x * 0.5)
      ,Math.floor(AssetManager.screenSize.y * 0.5)
    );
  };
  update() {
    if (AssetManager.isReady()) {
      StateManager.setState(StateManager.states.start);
    }
  };
};
