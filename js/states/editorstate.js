'use strict';

class EditorState extends State {

  static PHASES = {
    "load": 0
    ,"play": 1
  };

  static PLACEMENT_TYPES = {
    "spawnLocation": 0
    ,"controlPoint": 1
    ,"tile": 2
  };

  constructor(screenSize, keyManager, mouse) {
    super();

    // Phase Control
    this.currentPhase = EditorState.PHASES.load;

    // Display
    this.screenSize = screenSize;

    // Sprites
    this.tileSprites = new SpriteSheetGrid("res/images/tiles.png", 32, 32);
    this.editorSprites = new SpriteSheetCustom("res/images/editor.png");
    this.controlPointImages = [];
    this.redSpawnImage = undefined;
    this.blueSpawnImage = undefined;

    // Input
    this.keys = keyManager;
    this.mouse = mouse;
    this.hoveredTile = new Vector(0, 0);

    // Map
    this.map = undefined;
    this.mapOffset = new Vector(24, 24);

    // Menu
    this.menuOffset = new Vector(720, 24);
    this.menu = undefined;
    this.currentPlacementType = EditorState.PLACEMENT_TYPES.tile;
    this.currentPlacementId = 0;
    this.collisionSelect = -1;
  };
  render(ctx) {
    switch (this.currentPhase) {
      case EditorState.PHASES.load:
        // Draw Loading Screen
        ctx.font = "64px Monospace";
        ctx.fillStyle = "rgb(255,0,0)";
        ctx.textAlign = "center";
        ctx.fillText(
          "Loading..."
          ,Math.floor(this.screenSize.x * 0.5)
          ,Math.floor(this.screenSize.y * 0.5)
        );
        break;
      case EditorState.PHASES.play:
        // Map
        this.drawMap(ctx, this.mapOffset, this.mapScale);
        // Menu
        this.menu.render(ctx, this.menuOffset);
        break;
      default:
        break;
    }
  };
  update(elapsed) {
    switch (this.currentPhase) {
      case EditorState.PHASES.load:
        if (this.assetsLoaded()) {
          this.loadMap();
          // Set Loaded Images
          this.controlPointImages = [];
          for (let i = 0; i < this.map.controlPointLocations.length; i++) {
            this.controlPointImages.push(this.editorSprites.cutImage(536 + (i * 32), 48, 32, 32));
          }
          this.redSpawnImage = this.editorSprites.cutImage(536, 80, 32, 32);
          this.blueSpawnImage = this.editorSprites.cutImage(568, 80, 32, 32);
          // Menu
          this.initMenu();
          // All assets loaded, next phase
          this.currentPhase = EditorState.PHASES.play;
        }
        break;
      case EditorState.PHASES.play:
        // Map Interaction
        if (this.isMouseOnMap()) {
          this.mapInteraction();
        }
        // Menu Interaction
        if (this.isMouseOnMenu()) {
          this.menuInteraction();
        }
        break;
      default:
        break;
    }
  };
  assetsLoaded() {
    if (!this.tileSprites.loaded
      || !this.editorSprites.loaded) {
      return false;
    }
    return true;
  };
  loadMap() {
    // Check localStorage for existing map data
    let mapData = StorageManager.getLocalStorage("map");
    if (mapData != null) {
      // Found existing data, load that
      console.log("Loading mapData from localStorage.");
      this.map = new Map(JSON.parse(mapData));
    } else {
      // No existing map data found, use default map
      console.log("Loading mapData from default map.");
      this.map = new Map(DEFAULT_MAP);
    }
  };
  initMenu() {
    this.menu = new Menu(this.editorSprites.cutImage(0, 0, 536, 672));

    // Save ImageButton
    this.menu.imageButtons.push(new ImageButton(
      this.editorSprites.cutImage(536, 0, 75, 24)
      ,this.editorSprites.cutImage(611, 0, 75, 24)
      ,new Vector(437, 624)
      ,() => {
        this.currentPhase = EditorState.PHASES.load;
        this.mouse.reset();
        this.saveMap();
        this.cancelEditor();
      }
    ));//0

    // Reset ImageButton
    this.menu.imageButtons.push(new ImageButton(
      this.editorSprites.cutImage(536, 24, 92, 24)
      ,this.editorSprites.cutImage(628, 24, 92, 24)
      ,new Vector(24, 624)
      ,() => {
        this.mouse.reset();
        StorageManager.clear();
        this.loadMap();
      }
    ));//1

    // Red Team Spawn RadioButton
    this.menu.radioButtons.push(new RadioButton(
      this.redSpawnImage
      ,"rgb(0,255,0)"
      ,new Vector(220, 72)
      ,() => {
        console.log("Spawn: Red");
        this.currentPlacementType = EditorState.PLACEMENT_TYPES.spawnLocation;
        this.currentPlacementId = "red";
      }
    ));//0

    // Blue Team Spawn RadioButton
    this.menu.radioButtons.push(new RadioButton(
      this.blueSpawnImage
      ,"rgb(0,255,0)"
      ,new Vector(284, 72)
      ,() => {
        console.log("Spawn: Blue");
        this.currentPlacementType = EditorState.PLACEMENT_TYPES.spawnLocation;
        this.currentPlacementId = "blue";
      }
    ));//1

    /* Control Points */
    for (let i = 0; i < this.map.controlPointLocations.length; i++) {
      this.menu.radioButtons.push(new RadioButton(
        this.controlPointImages[i]
        ,"rgb(0,255,0)"
        ,new Vector(124 + (i * 64), 168)
        ,() => {
          console.log("ControlPoint: " + i);
          this.currentPlacementType = EditorState.PLACEMENT_TYPES.controlPoint;
          this.currentPlacementId = i;
        }
      ));//2-6
    }

    /* Tiles */
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        this.menu.radioButtons.push(new RadioButton(
          this.tileSprites.getImage((x + (y * 4)))
          ,"rgb(0,255,0)"
          ,new Vector(204 + (x * 32), 264 + (y *32))
          ,() => {
            console.log("Tile: " + (x + (y * 4)));
            this.currentPlacementType = EditorState.PLACEMENT_TYPES.tile;
            this.currentPlacementId = (x + (y * 4));
          }
        ));//7-23
      }
    }
    // Init Placement
    this.currentPlacementType = EditorState.PLACEMENT_TYPES.spawnLocation;
    this.currentPlacementId = "red";
    this.menu.radioButtons[0].isSelected = true;
  };
  drawMap(ctx) {
    this.map.renderEditor(ctx, this.tileSprites.images, this.mapOffset);
    // Red Team Spawn
    ctx.drawImage(
      this.redSpawnImage
      ,0,0
      ,this.redSpawnImage.width,this.redSpawnImage.height
      ,Math.floor((this.map.redSpawn.x * this.map.tileSize) + this.mapOffset.x)
      ,Math.floor((this.map.redSpawn.y * this.map.tileSize) + this.mapOffset.y)
      ,Math.floor(this.map.tileSize)
      ,Math.floor(this.map.tileSize)
    );
    // Blue Team Spawn
    ctx.drawImage(
      this.blueSpawnImage
      ,0,0
      ,this.blueSpawnImage.width,this.blueSpawnImage.height
      ,Math.floor((this.map.blueSpawn.x * this.map.tileSize) + this.mapOffset.x)
      ,Math.floor((this.map.blueSpawn.y * this.map.tileSize) + this.mapOffset.y)
      ,Math.floor(this.map.tileSize)
      ,Math.floor(this.map.tileSize)
    );
    // Control Points
    for (let i = 0; i < this.map.controlPointLocations.length; i++) {
      ctx.drawImage(
        this.controlPointImages[i]
        ,0,0
        ,this.controlPointImages[i].width,this.controlPointImages[i].height
        ,Math.floor((this.map.controlPointLocations[i].x * this.map.tileSize) + this.mapOffset.x)
        ,Math.floor((this.map.controlPointLocations[i].y * this.map.tileSize) + this.mapOffset.y)
        ,Math.floor(this.map.tileSize)
        ,Math.floor(this.map.tileSize)
      );
    }
    // Hover Tile Indicator
    if (this.isMouseOnMap()) {
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgb(0,255,0)";
      ctx.rect(
        Math.floor((this.hoveredTile.x * this.map.tileSize) + this.mapOffset.x)
        ,Math.floor((this.hoveredTile.y * this.map.tileSize) + this.mapOffset.y)
        ,Math.floor(this.map.tileSize)
        ,Math.floor(this.map.tileSize)
      );
      ctx.stroke();
    }
  };
  mapInteraction() {
    // Set Hovered Tile Position
    this.hoveredTile.x = Math.floor(Math.max(0, Math.min(
      this.map.width - 1, (this.mouse.pos.x - this.mapOffset.x) / this.map.tileSize))
    );
    this.hoveredTile.y = Math.floor(Math.max(0, Math.min(
      this.map.height - 1, (this.mouse.pos.y - this.mapOffset.y) / this.map.tileSize))
    );
    // Left Click
    if (this.mouse.buttonLeft) {
      this.mapLeftClick();
    }
    // Right Click
    if (this.mouse.buttonRight) {
      this.mapRightClick();
    } else {
      this.collisionSelect = -1;
    }
  };
  mapLeftClick() {
    switch(this.currentPlacementType) {
      case EditorState.PLACEMENT_TYPES.spawnLocation:
        if (this.currentPlacementId == "red") {
          if (this.isTileEmpty(this.hoveredTile.x, this.hoveredTile.y)) {
            this.map.redSpawn.x = this.hoveredTile.x;
            this.map.redSpawn.y = this.hoveredTile.y;
          }
        } else if (this.currentPlacementId == "blue") {
          if (this.isTileEmpty(this.hoveredTile.x, this.hoveredTile.y)) {
            this.map.blueSpawn.x = this.hoveredTile.x;
            this.map.blueSpawn.y = this.hoveredTile.y;
          }
        }
        break;
      case EditorState.PLACEMENT_TYPES.controlPoint:
        if (this.isTileEmpty(this.hoveredTile.x, this.hoveredTile.y)) {
          this.map.controlPointLocations[this.currentPlacementId].x = this.hoveredTile.x;
          this.map.controlPointLocations[this.currentPlacementId].y = this.hoveredTile.y;
        }
        break;
      case EditorState.PLACEMENT_TYPES.tile:
        this.map.tiles[this.hoveredTile.x][this.hoveredTile.y] = this.currentPlacementId;
        break;
      default:
        break;
    }
  };
  mapRightClick() {
    if (this.collisionSelect > -1) {
      this.map.grid[this.hoveredTile.x][this.hoveredTile.y] = this.collisionSelect;
    } else {
      if (this.map.grid[this.hoveredTile.x][this.hoveredTile.y] == 0) {
        this.collisionSelect = 1;
      } else {
        this.collisionSelect = 0;
      }
    }
  };
  menuInteraction() {
    this.menu.update(this.mouse.pos.sub(this.menuOffset), this.mouse.buttonLeft);
  };
  isTileEmpty(x, y) {
    // Check Grid
    if (this.map.grid[x][y] != 0) {
      return false;
    }
    // Spawn Locations
    if (this.map.redSpawn.x == x
      && this.map.redSpawn.y == y) {
      return false;
    }
    if (this.map.blueSpawn.x == x
      && this.map.blueSpawn.y == y) {
      return false;
    }
    // Control Points
    for (let i = 0; i < this.map.controlPointLocations.length; i++) {
      if (this.map.controlPointLocations[i].x == x
        && this.map.controlPointLocations[i].y == y) {
        return false;
      }
    }
    return true;
  };
  isMouseOnMap() {
    if (this.mouse.pos.x >= this.mapOffset.x
      && this.mouse.pos.x < this.mapOffset.x + (this.map.width * this.map.tileSize)
      && this.mouse.pos.y >= this.mapOffset.y
      && this.mouse.pos.y < this.mapOffset.y + (this.map.height * this.map.tileSize)) {
      return true;
    }
    return false;
  };
  isMouseOnMenu() {
    if (this.mouse.pos.x >= this.menuOffset.x
      && this.mouse.pos.x < this.menuOffset.x + this.menu.width
      && this.mouse.pos.y >= this.menuOffset.y
      && this.mouse.pos.y < this.menuOffset.y + this.menu.height) {
      return true;
    }
    return false;
  };
  saveMap() {
    let mapData = JSON.stringify(this.map);
    StorageManager.setLocalStorage("map", mapData);
  };
  startGame() {
    StateManager.setState("game");
  };
  cancelEditor() {
    StateManager.setState("start");
  };
};