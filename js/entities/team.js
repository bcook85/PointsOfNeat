'use strict';

class Team {
  static MAX_PLAYERS = 5;
  static POPULATION_COUNT = 100;
  static BRAIN_DIMENSIONS = [Player.MAX_INPUTS, 17, 10, Player.MAX_OUTPUTS];
  static RESPAWN_TIME = 60 * 3;

  constructor(teamId, spawnLocation, playerImage, bulletImage) {
    this.spawnLocation = spawnLocation;
    this.teamId = teamId;
    this.playerImage = playerImage;
    this.bulletImage = bulletImage;
    this.score = 0;
    this.totalScore = 0;
    this.controlledPoints = 0;
    this.players = [];
    this.bullets = [];
    this.neats = [];
    this.neatGroup = 0;
    this.displayVision = false;
  };
  initPlayers() {
    this.players = [];
    for (let i = 0; i < Team.MAX_PLAYERS; i++) {
      this.players.push(new Player(
        this.teamId
        ,new Vector(this.spawnLocation.x + 0.5, this.spawnLocation.y + 0.5)
        ,this.playerImage
        //,displayId = i + 1
      ));
    }
  };
  initNeats(neatData) {
    this.neats = [];
    for (let i = 0; i < Team.MAX_PLAYERS; i++) {
      this.neats.push(new Neat(Team.POPULATION_COUNT, Team.BRAIN_DIMENSIONS));
    }
  };
  nextGeneration() {
    for (let i = 0; i < this.neats.length; i++) {
      this.neats[i].nextGeneration();
    }
  };
  setNeatGroup(neatGroup) {
    this.neatGroup = neatGroup;
  };
  reset() {
    // Score & Control
    this.totalScore += this.score;
    this.score = 0;
    this.controlledPoints = 0;
    // Players
    for (let i = 0; i < this.players.length; i++) {
      this.neats[i].setBrainScore(this.neatGroup, this.players[i].score);
      this.players[i].reset();
    }
    // Bullets
    this.bullets = [];
  };
  createBullet(playerId, pos, direction) {
    let newBullet = new Bullet(playerId, pos, direction, this.bulletImage);
    for (let i = 0; i < this.bullets.length; i++) {
      if (!this.bullets[i].alive) {
        this.bullets[i] = newBullet;
        return;
      }
    }
    this.bullets.push(newBullet);
  };
  renderPlayers(ctx, offset, scale) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].alive) {
        this.players[i].render(ctx, offset, scale);

        if (this.displayVision) {
          this.players[i].renderVision(ctx, offset, scale);
        }
      }
      // draw i+1 on top of player with custom font for ID
    }
  };
  renderBullets(ctx, offset, scale) {
    for (let i = 0; i < this.bullets.length; i++) {
      if (this.bullets[i].alive) {
        this.bullets[i].render(ctx, offset, scale);
      }
    }
  };
  update(gameTick, enemies, map) {
    // Players
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].alive) {
        // Neural Network
        this.players[i].score += Player.POINTS.alive;
        this.players[i].processVision(this.players, enemies, map);
        let outputs = this.neats[i].processInput(this.neatGroup, this.players[i].visionInputs);
        this.players[i].setControlInputs(outputs);
        // Update Player
        this.players[i].update(
          gameTick
          ,this.players
          ,enemies
          ,map
        );
        // Player Attack
        if (this.players[i].canAttack(gameTick)) {
          this.players[i].attackLast = gameTick;
          this.createBullet(i, this.players[i].pos, this.players[i].direction);
        }
      } else if (gameTick >= this.players[i].deadLast + Team.RESPAWN_TIME) {
        this.players[i].respawn(this.spawnLocation);
      }
    }
    // Bullets
    for (let i = 0; i < this.bullets.length; i++) {
      if (this.bullets[i].alive) {
        this.bullets[i].update(map, enemies);
        // Check for hit on enemies
        for (let j = 0; j < enemies.length; j++) {
          if (enemies[j].alive && this.bullets[i].vsBall(enemies[j])) {
            this.bullets[i].alive = false;
            enemies[j].takeDamage(gameTick, this.bullets[i].damage);
            this.players[this.bullets[i].ownerId].score += Player.POINTS.damageEnemy;
            break;
          }
        }
        // Check for Grid Collision
        if (Ball.collidesGrid(this.bullets[i], map.grid)) {
          this.bullets[i].alive = false;
        }
      }
    }
  };
  getLivingPlayers() {
    let alive = [];
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].alive) {
        alive.push(this.players[i]);
      }
    }
    return alive;
  };
};
