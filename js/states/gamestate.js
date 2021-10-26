'use strict';

class GameState extends State {

  static PHASES = {
    "play": 0
    ,"reset": 1
  };

  static TEAM_ID = {
    "red": 0
    ,"blue": 1
    ,"neutral": 2
  };

  static MAX_GROUP_TICK = 60 * 30;// 60 frames per second * N = N Seconds
  static SPEED_UP = 10;
  static FILE_DATA = undefined;

  constructor(keyManager, mouse) {
    super();

    // Timing
    this.gameTick = 0;
    this.gameElapsed = 0;
    this.fps = 0;
    this.groupTick = 0;
    this.gameSpeed = 1;

    // Input
    this.keys = keyManager;
    this.mouse = mouse;

    // Game Phase
    this.currentPhase = GameState.PHASES.reset;

    // Teams
    this.redTeam = undefined;
    this.blueTeam = undefined;

    // NEAT
    this.neatGroup = 0;
    this.generation = 0;

    // Map
    this.mapOffset = new Vector(24, 24);
    this.map = undefined;

    // GUI/Menu
    this.menu = undefined;
    this.menuOffset = new Vector(720, 24);
  };
  init() {
    this.initMap();
    this.initTeams();
    this.initMenu();
    this.initNeats();
    this.currentPhase = GameState.PHASES.play;
  };
  initMap() {
    // Check localStorage for existing map data
    let mapData = StorageManager.getLocalStorage("map");
    if (mapData != null) {
      // Found existing data, load that
      console.log("Map Data: localStorage");
      this.map = new Map(JSON.parse(mapData));
    } else {
      // No existing map data found, use default map
      console.log("Map Data: default");
      this.map = new Map(DEFAULT_MAP);
    }
    this.map.buildImage(AssetManager.assets.gSpriteTiles.images);
    this.map.initControlPoints(
      AssetManager.assets.gSpriteEntities.getImage(2)
      ,AssetManager.assets.gSpriteEntities.getImage(3)
      ,AssetManager.assets.gSpriteEntities.getImage(4)
    );
  };
  initMenu() {
    this.menu = new Menu(AssetManager.assets.cSpriteGame.cutImage(0, 0, 536, 672));

    // Generation
    this.menu.textItems.push(new DynamicText(
      new Vector(310, 67)
      ,new Vector(101, 16)
    ));
    this.menu.textItems[0].update([this.generation], AssetManager.assets.gSpriteFont);
    // Group
    this.menu.textItems.push(new DynamicText(
      new Vector(185, 115)
      ,new Vector(67, 16)
    ));
    this.menu.textItems[1].update([this.neatGroup + 1], AssetManager.assets.gSpriteFont);
    // Time
    this.menu.textItems.push(new DynamicText(
      new Vector(367, 115)
      ,new Vector(67, 16)
    ));
    this.menu.textItems[2].update(this.calculateTimeRemaining(), AssetManager.assets.gSpriteFont);
    // Red 1
    this.menu.textItems.push(new DynamicText(
      new Vector(125, 211)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[3].update("0", AssetManager.assets.gSpriteFont);
    // Red 2
    this.menu.textItems.push(new DynamicText(
      new Vector(125, 251)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[4].update("0", AssetManager.assets.gSpriteFont);
    // Red 3
    this.menu.textItems.push(new DynamicText(
      new Vector(125, 291)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[5].update("0", AssetManager.assets.gSpriteFont);
    // Red 4
    this.menu.textItems.push(new DynamicText(
      new Vector(125, 331)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[6].update("0", AssetManager.assets.gSpriteFont);
    // Red 5
    this.menu.textItems.push(new DynamicText(
      new Vector(125, 371)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[7].update("0", AssetManager.assets.gSpriteFont);
    // Blue 1
    this.menu.textItems.push(new DynamicText(
      new Vector(325, 211)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[8].update("0", AssetManager.assets.gSpriteFont);
    // Blue 2
    this.menu.textItems.push(new DynamicText(
      new Vector(325, 251)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[9].update("0", AssetManager.assets.gSpriteFont);
    // Blue 3
    this.menu.textItems.push(new DynamicText(
      new Vector(325, 291)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[10].update("0", AssetManager.assets.gSpriteFont);
    // Blue 4
    this.menu.textItems.push(new DynamicText(
      new Vector(325, 331)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[11].update("0", AssetManager.assets.gSpriteFont);
    // Blue 5
    this.menu.textItems.push(new DynamicText(
      new Vector(325, 371)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[12].update("0", AssetManager.assets.gSpriteFont);

    // Speed Button
    this.menu.toggleButtons.push(new ToggleButton(
      AssetManager.assets.cSpriteGame.cutImage(0, 672, 38, 24)
      ,"rgb(0,255,0)"
      ,new Vector(192, 624)
      ,() => {
        if (this.gameSpeed == GameState.SPEED_UP) {
          this.gameSpeed = 1;
        } else {
          this.gameSpeed = GameState.SPEED_UP;
        }
      }
    ));
    // Vision Button
    this.menu.toggleButtons.push(new ToggleButton(
      AssetManager.assets.cSpriteGame.cutImage(76, 672, 38, 24)
      ,"rgb(0,255,0)"
      ,new Vector(254, 624)
      ,() => {
        this.redTeam.displayVision = !this.redTeam.displayVision;
        this.blueTeam.displayVision = !this.blueTeam.displayVision;
      }
    ));
    // Save Button
    this.menu.imageButtons.push(new ImageButton(
      AssetManager.assets.cSpriteGame.cutImage(152, 672, 38, 24)
      ,AssetManager.assets.cSpriteGame.cutImage(190, 672, 38, 24)
      ,new Vector(316, 624)
      ,() => {
        this.saveNeats();
      }
    ));
  }
  initTeams() {
    this.redTeam = new Team(
      GameState.TEAM_ID.red
      ,new Vector(this.map.redSpawn.x, this.map.redSpawn.y)
      ,AssetManager.assets.gSpriteEntities.getImage(0)
      ,AssetManager.assets.gSpriteEntities.getImage(5)
    );
    this.blueTeam = new Team(
      GameState.TEAM_ID.blue
      ,new Vector(this.map.blueSpawn.x, this.map.blueSpawn.y)
      ,AssetManager.assets.gSpriteEntities.getImage(1)
      ,AssetManager.assets.gSpriteEntities.getImage(6)
    );
    this.redTeam.initPlayers();
    this.blueTeam.initPlayers();
  };
  initNeats() {
    this.redTeam.initNeats();
    this.blueTeam.initNeats();
    if (GameState.FILE_DATA != undefined) {
      let neatData = JSON.parse(GameState.FILE_DATA);
      if (neatData.generation) {
        this.generation = parseInt(neatData.generation);
        this.menu.textItems[0].update([this.generation], AssetManager.assets.gSpriteFont);
        for (let i = 0; i < Team.MAX_PLAYERS; i++) {
          this.redTeam.neats[i].load(neatData.redNeats[i]);
          this.blueTeam.neats[i].load(neatData.blueNeats[i]);
        }
      }
      GameState.FILE_DATA = undefined;
    }
  };
  render(ctx) {
    switch(this.currentPhase) {
      case GameState.PHASES.play:
        this.renderPlay(ctx);
        break;
      case GameState.PHASES.reset:
        ctx.font = "96px Monospace";
        ctx.fillStyle = "rgb(255,0,0)";
        ctx.textAlign = "center";
        ctx.fillText(
          "Resetting..."
          ,Math.floor(AssetManager.screenSize.x * 0.5)
          ,Math.floor(AssetManager.screenSize.y * 0.5)
        );
        break;
    }
    this.renderFps(ctx);
  };
  renderFps(ctx) {
    ctx.font = "18px Monospace";
    ctx.fillStyle = "rgb(0,255,0)";
    ctx.textAlign = "right";
    ctx.fillText(this.fps, AssetManager.screenSize.x, AssetManager.screenSize.y - 2);
  };
  renderPlay(ctx) {
    this.map.render(ctx, this.mapOffset);
    // Players
    this.redTeam.renderPlayers(ctx, this.mapOffset, this.map.tileSize);
    this.blueTeam.renderPlayers(ctx, this.mapOffset, this.map.tileSize);
    // Bullets
    this.redTeam.renderBullets(ctx, this.mapOffset, this.map.tileSize);
    this.blueTeam.renderBullets(ctx, this.mapOffset, this.map.tileSize);
    // Control Points
    this.map.renderControlPoints(ctx, this.mapOffset);
    // Time Remaining
    this.menu.textItems[2].update(this.calculateTimeRemaining(), AssetManager.assets.gSpriteFont);
    // Player Scores
    this.updatePlayerScores();
    // Menu
    this.menu.render(ctx, this.menuOffset);
  };
  update(elapsed) {
    this.timing(elapsed);
    switch(this.currentPhase) {
      case GameState.PHASES.play:
        this.updatePlay();
        break;
      case GameState.PHASES.reset:
        this.updateReset();
        break;
    }
  };
  timing(elapsed) {
    this.gameElapsed = elapsed;
    this.fps = Math.round(1000 / this.gameElapsed);
    this.gameTick++;
  };
  updatePlay() {
    for (let i = 0; i < this.gameSpeed; i++) {
      this.redTeam.update(this.groupTick, this.blueTeam.getLivingPlayers(), this.map);
      this.blueTeam.update(this.groupTick, this.redTeam.getLivingPlayers(), this.map);
      this.map.update(this.groupTick, this.redTeam.getLivingPlayers(), this.blueTeam.getLivingPlayers());
      this.groupTick += 1;
      if (this.groupTick >= GameState.MAX_GROUP_TICK) {
        this.currentPhase = GameState.PHASES.reset;
        break;
      }
    }
    this.menu.update(this.mouse.pos.sub(this.menuOffset), this.mouse.buttonLeft);
    this.mouse.reset();
  };
  updateReset() {
    // Reset Game
    this.groupTick = 0;
    this.map.reset();
    this.redTeam.reset();
    this.blueTeam.reset();
    // Handle Neat Group/Generation
    this.neatGroup += 1;
    if (this.neatGroup >= Team.POPULATION_COUNT) {
      this.neatGroup = 0;
      this.redTeam.nextGeneration();
      this.blueTeam.nextGeneration();
      this.generation += 1;
      this.menu.textItems[0].update([this.generation], AssetManager.assets.gSpriteFont);
    }
    this.menu.textItems[1].update([this.neatGroup + 1], AssetManager.assets.gSpriteFont);
    // Set Neat Group for next group
    this.redTeam.setNeatGroup(this.neatGroup);
    this.blueTeam.setNeatGroup(this.neatGroup);
    this.currentPhase = GameState.PHASES.play;
  };
  saveNeats() {
    let redNeats = [];
    let blueNeats = [];
    for (let i = 0; i < Team.MAX_PLAYERS; i++) {
      redNeats.push(this.redTeam.neats[i].save());
      blueNeats.push(this.blueTeam.neats[i].save());
    }
    let neatData = JSON.stringify({
      "generation": this.generation
      ,"redNeats": redNeats
      ,"blueNeats": blueNeats
    });
    let file = new Blob([neatData], {type: 'text/json'});
    let a = document.createElement("a");
    let url = URL.createObjectURL(file);
    a.href = url;
    a.download = `PointsOfNeat_Generation_${this.generation}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  };
  calculateTimeRemaining() {
    let timeLeft = Math.round((GameState.MAX_GROUP_TICK - this.groupTick) / 60);
    if (timeLeft.toString().length == 1) {
      return [timeLeft.toString()];
    } else {
      return timeLeft.toString();
    }
  };
  updatePlayerScores() {
    this.menu.textItems[3].update(Math.floor(this.redTeam.players[0].score), AssetManager.assets.gSpriteFont);// Red 1
    this.menu.textItems[4].update(Math.floor(this.redTeam.players[1].score), AssetManager.assets.gSpriteFont);// Red 2
    this.menu.textItems[5].update(Math.floor(this.redTeam.players[2].score), AssetManager.assets.gSpriteFont);// Red 3
    this.menu.textItems[6].update(Math.floor(this.redTeam.players[3].score), AssetManager.assets.gSpriteFont);// Red 4
    this.menu.textItems[7].update(Math.floor(this.redTeam.players[4].score), AssetManager.assets.gSpriteFont);// Red 5
    this.menu.textItems[8].update(Math.floor(this.blueTeam.players[0].score), AssetManager.assets.gSpriteFont);// Blue 1
    this.menu.textItems[9].update(Math.floor(this.blueTeam.players[1].score), AssetManager.assets.gSpriteFont);// Blue 2
    this.menu.textItems[10].update(Math.floor(this.blueTeam.players[2].score), AssetManager.assets.gSpriteFont);// Blue 3
    this.menu.textItems[11].update(Math.floor(this.blueTeam.players[3].score), AssetManager.assets.gSpriteFont);// Blue 4
    this.menu.textItems[12].update(Math.floor(this.blueTeam.players[4].score), AssetManager.assets.gSpriteFont);// Blue 5
  };
  calculateRays_180(count) {
    let rays = [];
    let perRay = Math.PI / (count - 1);
    for (let i = 0; i < count; i++) {
      let dir = (Math.PI * -0.5) + (i * perRay);
      rays.push(dir);
    }
    console.log(rays);
  };
  calculateRays_360(count) {
    let rays = [];
    let perRay = Math.PI * 2 / (count - 1);
    for (let i = 0; i < count; i++) {
      let dir = -Math.PI + (i * perRay);
      rays.push(dir);
    }
    console.log(rays);
  };
};
