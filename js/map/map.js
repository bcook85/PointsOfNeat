'use strict';

class Map {
  constructor(mapData) {
    this.width = mapData.width;
    this.height = mapData.height;
    this.tileSize = mapData.tileSize;
    this.tiles = [];
    this.grid = [];
    for (let x = 0; x < this.width; x++) {
      let tileCol = [];
      let gridCol = [];
      for (let y = 0; y < this.height; y++) {
        tileCol.push(mapData.tiles[x][y]);
        gridCol.push(mapData.grid[x][y]);
      }
      this.tiles.push(tileCol);
      this.grid.push(gridCol);
    }
    this.redSpawn = new Vector(mapData.redSpawn.x, mapData.redSpawn.y);
    this.blueSpawn = new Vector(mapData.blueSpawn.x, mapData.blueSpawn.y);
    this.controlPoints = [];
    this.controlPointLocations = [];
    for (let i = 0; i < mapData.controlPointLocations.length; i++) {
      this.controlPointLocations.push(new Vector(
        mapData.controlPointLocations[i].x
        ,mapData.controlPointLocations[i].y
      ));
    }
    this.image = undefined;
  };
  initControlPoints(neutralCPImage, redCPImage, blueCPImage) {
    for (let i = 0; i < this.controlPointLocations.length; i++) {
      this.controlPoints.push(new ControlPoint(
        new Vector(this.controlPointLocations[i].x + 0.5, this.controlPointLocations[i].y + 0.5)
        ,neutralCPImage
        ,redCPImage
        ,blueCPImage
      ));
    }
  };
  buildImage(tileSprites) {
    this.image = document.createElement("canvas");
    this.image.width = this.width * this.tileSize;
    this.image.height = this.height * this.tileSize;
    let ctx = this.image.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        ctx.drawImage(
          tileSprites[this.tiles[x][y]]
          ,0,0
          ,tileSprites[this.tiles[x][y]].width
          ,tileSprites[this.tiles[x][y]].height
          ,x * this.tileSize
          ,y * this.tileSize
          ,this.tileSize
          ,this.tileSize
        );
      }
    }
  };
  render(ctx, offset) {
    ctx.drawImage(
      this.image
      ,0, 0
      ,this.image.width, this.image.height
      ,Math.floor(offset.x), Math.floor(offset.y)
      ,Math.floor(this.image.width), Math.floor(this.image.height)
    );
  };
  renderEditor(ctx, tileSprites, offset) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        // Tile Image
        ctx.drawImage(
          tileSprites[this.tiles[x][y]]
          ,0, 0
          ,tileSprites[this.tiles[x][y]].width
          ,tileSprites[this.tiles[x][y]].height
          ,Math.floor((x * this.tileSize) + offset.x)
          ,Math.floor((y * this.tileSize) + offset.y)
          ,Math.floor(this.tileSize)
          ,Math.floor(this.tileSize)
        );
        // Collision Indicator
        if (this.grid[x][y] == 1) {
          ctx.fillStyle = "rgba(255,0,0,0.25)";
          ctx.fillRect(
            Math.floor((x * this.tileSize) + offset.x)
            ,Math.floor((y * this.tileSize) + offset.y)
            ,Math.floor(this.tileSize)
            ,Math.floor(this.tileSize)
          );
        }
      }
    }
  };
  renderControlPoints(ctx, offset) {
    for (let i = 0; i < this.controlPoints.length; i++) {
      this.controlPoints[i].render(ctx, offset, this.tileSize);
    }
  };
  update(gameTick, redPlayers, bluePlayers) {
    for (let i = 0; i < this.controlPoints.length; i++) {
      if (gameTick >= this.controlPoints[i].captureLast + this.controlPoints[i].captureTickTime) {
        this.controlPoints[i].captureLast = gameTick;
        // determine redTeamCapping and blueTeamCapping
        let redTeamCapping = false;
        let blueTeamCapping = false;
        for (let r = 0; r < redPlayers.length; r++) {
          if (redPlayers[r].alive) {
            if (this.controlPoints[i].pos.getDistance(redPlayers[r].pos) <= ControlPoint.CAPTURE_RADIUS) {
              redTeamCapping = true;
              break;
            }
          }
        }
        for (let b = 0; b < bluePlayers.length; b++) {
          if (bluePlayers[b].alive) {
            if (this.controlPoints[i].pos.getDistance(bluePlayers[b].pos) <= ControlPoint.CAPTURE_RADIUS) {
              blueTeamCapping = true;
              break;
            }
          }
        }
        this.controlPoints[i].update(redTeamCapping, blueTeamCapping);
      }
    }
  };
  reset(gameTick) {
    for (let i = 0; i < this.controlPoints.length; i++) {
      this.controlPoints[i].reset(gameTick);
    }
  };
  getTeamControlPoints(teamId) {
    let teamControlPoints = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      if (this.controlPoints[i].currentOwner == teamId) {
        teamControlPoints.push(this.controlPoints[i]);
      }
    }
    return teamControlPoints;
  };
  getUnownedControlPoints(teamId) {
    let unownedControlPoints = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      if (this.controlPoints[i].currentOwner != teamId) {
        unownedControlPoints.push(this.controlPoints[i]);
      }
    }
    return unownedControlPoints;
  };
};
