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
  static FILE_DATA = undefined;

  constructor(screenSize, keyManager, mouse) {
    super(screenSize, keyManager, mouse);

    // Timing
    this.gameTick = 0;
    this.gameElapsed = 0;
    this.fps = 0;
    this.groupTick = 0;
    this.fast = false;
    this.fastDuration = 8;// Millisecond duration of fast update

    // Game Phase
    this.currentPhase = GameState.PHASES.reset;

    // Teams
    this.redTeam = undefined;
    this.blueTeam = undefined;
    this.playerIdImages = [];

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
    this.map.buildImage(AssetManager.gSpriteTiles.images);
    this.map.initControlPoints(
      AssetManager.gSpriteEntities.getImage(2)
      ,AssetManager.gSpriteEntities.getImage(3)
      ,AssetManager.gSpriteEntities.getImage(4)
    );
  };
  initMenu() {
    this.menu = new Menu(AssetManager.cSpriteGame.cutImage(0, 0, 536, 672));

    // Generation
    this.menu.textItems.push(new DynamicText(
      new Vector(310, 67)
      ,new Vector(101, 16)
    ));
    this.menu.textItems[0].update([this.generation], AssetManager.gSpriteFontTeal);
    // Group
    this.menu.textItems.push(new DynamicText(
      new Vector(185, 115)
      ,new Vector(67, 16)
    ));
    this.menu.textItems[1].update([this.neatGroup + 1], AssetManager.gSpriteFontTeal);
    // Time
    this.menu.textItems.push(new DynamicText(
      new Vector(367, 115)
      ,new Vector(67, 16)
    ));
    this.menu.textItems[2].update(this.calculateTimeRemaining(), AssetManager.gSpriteFontTeal);
    // Red 1
    this.menu.textItems.push(new DynamicText(
      new Vector(125, 211)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[3].update("0", AssetManager.gSpriteFontTeal);
    // Red 2
    this.menu.textItems.push(new DynamicText(
      new Vector(125, 251)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[4].update("0", AssetManager.gSpriteFontTeal);
    // Red 3
    this.menu.textItems.push(new DynamicText(
      new Vector(125, 291)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[5].update("0", AssetManager.gSpriteFontTeal);
    // Red 4
    this.menu.textItems.push(new DynamicText(
      new Vector(125, 331)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[6].update("0", AssetManager.gSpriteFontTeal);
    // Red 5
    this.menu.textItems.push(new DynamicText(
      new Vector(125, 371)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[7].update("0", AssetManager.gSpriteFontTeal);
    // Blue 1
    this.menu.textItems.push(new DynamicText(
      new Vector(325, 211)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[8].update("0", AssetManager.gSpriteFontTeal);
    // Blue 2
    this.menu.textItems.push(new DynamicText(
      new Vector(325, 251)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[9].update("0", AssetManager.gSpriteFontTeal);
    // Blue 3
    this.menu.textItems.push(new DynamicText(
      new Vector(325, 291)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[10].update("0", AssetManager.gSpriteFontTeal);
    // Blue 4
    this.menu.textItems.push(new DynamicText(
      new Vector(325, 331)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[11].update("0", AssetManager.gSpriteFontTeal);
    // Blue 5
    this.menu.textItems.push(new DynamicText(
      new Vector(325, 371)
      ,new Vector(84, 16)
    ));
    this.menu.textItems[12].update("0", AssetManager.gSpriteFontTeal);

    // Speed Button
    this.menu.toggleButtons.push(new ToggleButton(
      AssetManager.cSpriteGame.cutImage(0, 672, 38, 24)
      ,"rgb(0,255,0)"
      ,new Vector(192, 624)
      ,() => {
        this.fast = !this.fast;
      }
    ));
    // Vision Button
    this.menu.toggleButtons.push(new ToggleButton(
      AssetManager.cSpriteGame.cutImage(76, 672, 38, 24)
      ,"rgb(0,255,0)"
      ,new Vector(254, 624)
      ,() => {
        this.redTeam.displayVision = !this.redTeam.displayVision;
        this.blueTeam.displayVision = !this.blueTeam.displayVision;
      }
    ));
    // Save Button
    this.menu.imageButtons.push(new ImageButton(
      AssetManager.cSpriteGame.cutImage(152, 672, 38, 24)
      ,AssetManager.cSpriteGame.cutImage(190, 672, 38, 24)
      ,new Vector(316, 624)
      ,() => {
        this.saveNeats();
      }
    ));
  };
  initTeams() {
    // Player Id Images
    for (let i = 1; i <= Team.MAX_PLAYERS; i++) {
      this.playerIdImages.push(Font.createImage(
        i.toString()
        ,new Vector(AssetManager.gSpriteFontLime.frameWidth, AssetManager.gSpriteFontLime.frameHeight)
        ,AssetManager.gSpriteFontLime
      ));
    }
    this.redTeam = new Team(
      GameState.TEAM_ID.red
      ,new Vector(this.map.redSpawn.x, this.map.redSpawn.y)
      ,AssetManager.gSpriteEntities.getImage(0)
      ,AssetManager.gSpriteEntities.getImage(5)
    );
    this.blueTeam = new Team(
      GameState.TEAM_ID.blue
      ,new Vector(this.map.blueSpawn.x, this.map.blueSpawn.y)
      ,AssetManager.gSpriteEntities.getImage(1)
      ,AssetManager.gSpriteEntities.getImage(6)
    );
    this.redTeam.initPlayers(this.playerIdImages);
    this.blueTeam.initPlayers(this.playerIdImages);
  };
  initNeats() {
    // Initialize as new
    this.redTeam.initNeats();
    this.blueTeam.initNeats();
    // If Load Sim, load data
    if (GameState.FILE_DATA != undefined) {
      let neatData = JSON.parse(GameState.FILE_DATA);
      this.generation = parseInt(neatData.generation);
      this.menu.textItems[0].update([this.generation], AssetManager.gSpriteFontTeal);
      for (let i = 0; i < Team.MAX_PLAYERS; i++) {
        this.redTeam.neats[i].load(neatData.redNeats[i]);
        this.blueTeam.neats[i].load(neatData.blueNeats[i]);
      }
      GameState.FILE_DATA = undefined;
      console.log("NEAT Data: File");
    } else {
      console.log("NEAT Data: New");
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
          ,Math.floor(this.screenSize.x * 0.5)
          ,Math.floor(this.screenSize.y * 0.5)
        );
        break;
    }
    this.renderFps(ctx);
  };
  renderFps(ctx) {
    ctx.font = "18px Monospace";
    ctx.fillStyle = "rgb(0,255,0)";
    ctx.textAlign = "right";
    ctx.fillText(this.fps, this.screenSize.x, this.screenSize.y - 2);
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
    this.menu.textItems[2].update(this.calculateTimeRemaining(), AssetManager.gSpriteFontTeal);
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
    if (this.fast) {
      let stopTime = performance.now() + this.fastDuration;
      while (performance.now() < stopTime) {
        this.redTeam.update(this.groupTick, this.blueTeam.players, this.map);
        this.blueTeam.update(this.groupTick, this.redTeam.players, this.map);
        this.map.update(this.groupTick, this.redTeam.players, this.blueTeam.players);
        this.groupTick += 1;
        if (this.groupTick >= GameState.MAX_GROUP_TICK) {
          this.currentPhase = GameState.PHASES.reset;
          break;
        }
      }
    } else {
      this.redTeam.update(this.groupTick, this.blueTeam.players, this.map);
      this.blueTeam.update(this.groupTick, this.redTeam.players, this.map);
      this.map.update(this.groupTick, this.redTeam.players, this.blueTeam.players);
      this.groupTick += 1;
      if (this.groupTick >= GameState.MAX_GROUP_TICK) {
        this.currentPhase = GameState.PHASES.reset;
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
      this.menu.textItems[0].update([this.generation], AssetManager.gSpriteFontTeal);
    }
    this.menu.textItems[1].update([this.neatGroup + 1], AssetManager.gSpriteFontTeal);
    // Set Neat Group for next group
    this.redTeam.setNeatGroup(this.neatGroup);
    this.blueTeam.setNeatGroup(this.neatGroup);
    // And restart
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
    this.menu.textItems[3].update(Math.floor(this.redTeam.players[0].score), AssetManager.gSpriteFontTeal);// Red 1
    this.menu.textItems[4].update(Math.floor(this.redTeam.players[1].score), AssetManager.gSpriteFontTeal);// Red 2
    this.menu.textItems[5].update(Math.floor(this.redTeam.players[2].score), AssetManager.gSpriteFontTeal);// Red 3
    this.menu.textItems[6].update(Math.floor(this.redTeam.players[3].score), AssetManager.gSpriteFontTeal);// Red 4
    this.menu.textItems[7].update(Math.floor(this.redTeam.players[4].score), AssetManager.gSpriteFontTeal);// Red 5
    this.menu.textItems[8].update(Math.floor(this.blueTeam.players[0].score), AssetManager.gSpriteFontTeal);// Blue 1
    this.menu.textItems[9].update(Math.floor(this.blueTeam.players[1].score), AssetManager.gSpriteFontTeal);// Blue 2
    this.menu.textItems[10].update(Math.floor(this.blueTeam.players[2].score), AssetManager.gSpriteFontTeal);// Blue 3
    this.menu.textItems[11].update(Math.floor(this.blueTeam.players[3].score), AssetManager.gSpriteFontTeal);// Blue 4
    this.menu.textItems[12].update(Math.floor(this.blueTeam.players[4].score), AssetManager.gSpriteFontTeal);// Blue 5
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
