'use strict';

class Player extends Ball {

  static VISION_RAYS = [
    -1.5707963267948966
    ,-1.2566370614359172
    ,-0.9424777960769379
    ,-0.6283185307179586
    ,-0.3141592653589793
    ,0
    ,0.3141592653589793
    ,0.6283185307179586
    ,0.9424777960769379
    ,1.2566370614359172
    ,1.5707963267948966
  ];
  static VISION_TYPES = {
    "empty": 0.0
    ,"wall": 0.2
    ,"ally": 0.4
    ,"enemy": 0.6
    ,"controlPointTeam": 0.8
    ,"controlPointEnemy": 1
  };
  static INFO_INPUT_COUNT = 6;// = 1hp + 1isCapping +1attackCooldown + 2recurrence + 1bias
  static MAX_INPUTS = (Player.VISION_RAYS.length * 2) + Player.INFO_INPUT_COUNT;// = typesCount + distancesCount + infoCount
  static MAX_OUTPUTS = 9;// = 1tLeft + 1tRight + 1forward + 1back + 1sLeft + 1sRight + 1attack + 2recurrence
  static VIEW_DISTANCE = 12.0;
  static POINTS = {
    "damageEnemy": 25
    ,"inControlPointRadius": 0.2
    ,"alive": 0.0001
    ,"distance": 0.01
  };

  constructor(teamId, position, image, idImage) {
    super(position, 0.5);

    // Stats
    this.teamId = teamId;
    this.alive = true;
    this.deadLast = -Infinity;
    this.maxHP = 100;
    this.hp = this.maxHP;
    this.moveSpeed = 0.08;
    this.turnSpeed = Math.PI / 12;
    this.direction = Math.random() * Math.PI * 2;
    this.turning = 0;
    this.home = new Vector(this.pos.x, this.pos.y);

    // Control Points
    this.isCapping = 0;

    // Render
    this.image = image;
    this.idImage = idImage;

    // Ranged Attack
    this.attack = 0; // desire to attack
    this.attackCooldown = 15;
    this.attackLast = -this.attackCooldown;

    // Score
    this.score = 0;
    this.isCapping = 0;
    this.maxDistance = 0;

    // Controls
    this.controlInputs = new Array(Player.MAX_OUTPUTS).fill(0.0);
    this.recurrence = new Array(2).fill(0.0);
    this.visionInputs = new Array(Player.MAX_INPUTS).fill(0.0);
  };
  reset() {
    this.pos = new Vector(this.home.x, this.home.y);
    this.vel = new Vector(0.0, 0.0);
    this.direction = Math.random() * Math.PI * 2;
    this.turning = 0;
    // Controls
    this.recurrence = new Array(2).fill(0.0);
    // Stats
    this.hp = this.maxHP;
    this.alive = true;
    this.score = 0;
    this.maxDistance = 0;
    this.attackLast = -this.attackCooldown;
    this.deadLast = -Infinity;
  };
  respawn() {
    this.pos = new Vector(this.home.x, this.home.y);
    this.vel = new Vector(0.0, 0.0);
    this.direction = Math.random() * Math.PI * 2;
    this.turning = 0;
    // Stats
    this.hp = this.maxHP;
    this.alive = true;
    this.attackLast = -this.attackCooldown;
    this.deadLast = -Infinity;
  };
  render(ctx, offset, scale) {
    ctx.save();
    // Move to Draw Position
    ctx.translate(
      Math.floor((this.pos.x * scale) + offset.x)
      ,Math.floor((this.pos.y * scale) + offset.y)
    );
    // Draw Id Image
    ctx.drawImage(
      this.idImage
      ,0 ,0
      ,this.idImage.width, this.idImage.height
      ,Math.floor(scale * -1) - 1, Math.floor(scale * -1)
      ,Math.floor(scale * 0.5), Math.floor(scale * 0.5)
    );
    // Health Bar
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(
      Math.floor(scale * -0.5)
      ,Math.floor(scale * -0.75)
      ,Math.floor(scale)
      ,Math.floor(scale * 0.125)
    );
    ctx.fillStyle = "rgb(0,255,0)";
    ctx.fillRect(
      Math.floor(scale * -0.5)
      ,Math.floor(scale * -0.75)
      ,Math.floor(scale * (this.hp / this.maxHP))
      ,Math.floor(scale * 0.125)
    );
    // Rotate to Player.Direction
    ctx.rotate(this.direction);
    // Draw Image
    ctx.drawImage(
      this.image
      ,0 ,0
      ,this.image.width, this.image.height
      ,Math.floor(scale * -0.5), Math.floor(scale * -0.5)
      ,Math.floor(scale), Math.floor(scale)
    );
    ctx.restore();
  };
  renderVision(ctx, offset, scale) {
    ctx.lineWidth = 1;
    for (let i = 0; i < Player.VISION_RAYS.length; i++) {
      if (this.visionInputs[i * 2] != Player.VISION_TYPES.empty) {
        if (this.visionInputs[(i * 2)] == Player.VISION_TYPES.wall) {
          ctx.strokeStyle = "rgb(128,128,128)";
        } else if (this.visionInputs[i * 2] == Player.VISION_TYPES.ally) {
          ctx.strokeStyle = "rgb(0,255,0)";
        } else if (this.visionInputs[i * 2] == Player.VISION_TYPES.enemy) {
          ctx.strokeStyle = "rgb(255,0,0)";
        } else if (this.visionInputs[i * 2] == Player.VISION_TYPES.controlPointTeam) {
          ctx.strokeStyle = "rgb(0,255,0)";
        } else if (this.visionInputs[i * 2] == Player.VISION_TYPES.controlPointEnemy) {
          ctx.strokeStyle = "rgb(255,0,0)";
        }
        let contactPoint = this.pos.add(
          Vector.fromAngle(this.direction + Player.VISION_RAYS[i])
          .mul((this.visionInputs[(i * 2) + 1]) * Player.VIEW_DISTANCE)
        );
        ctx.beginPath();
        ctx.moveTo(Math.floor(this.pos.x * scale) + offset.x, Math.floor(this.pos.y * scale) + offset.y);
        ctx.lineTo(Math.floor(contactPoint.x * scale) + offset.x, Math.floor(contactPoint.y * scale) + offset.y);
        ctx.stroke();
      }
    }
  };
  update(gameTick, allies, enemies, map) {
    if (gameTick >= this.attackLast + this.attackCooldown) {
      this.move(map, enemies);
      // Distance From Home
      let currentDistance = this.home.sub(this.pos).mag2();
      if (currentDistance > this.maxDistance) {
        this.score += Player.POINTS.distance;
        this.maxDistance = currentDistance;
      }
    }
    this.controlPointInteraction(map);
  };
  processControlInputs(controlInputs) {
    this.controlInputs = controlInputs;
    /* [turnLeft, turnRight, moveForward, moveBackward, strafeLeft, strafeRight, attack, recurrence1, recurrence2] */
    // Controls - Turning
    this.turning = this.turnSpeed * (this.controlInputs[0] - this.controlInputs[1]);
    // Controls - Movement
    let movement = new Vector(
      this.controlInputs[4] - this.controlInputs[5] // Strafing
      ,this.controlInputs[2] - this.controlInputs[3] // Forward/backward
    );
    // Controls - Attack
    this.attack = Math.round(this.controlInputs[6]);
    // Recurrence
    this.recurrence = [this.controlInputs[7], this.controlInputs[8]];
    // Set Velocity
    this.vel = movement.normalize().rot(this.direction).mul(this.moveSpeed);
  };
  move(map, enemies) {
    // Turning
    this.direction += this.turning;
    if (this.direction < -Math.PI) {
      this.direction += Math.PI * 2;
    } else if (this.direction > Math.PI) {
      this.direction -= Math.PI * 2;
    }
    // Collision to adjust velocity
    for (let i = 0; i < map.controlPoints.length; i++) {
      Ball.resolveBallCollision(this, map.controlPoints[i]);
    }
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i].alive) {
        Ball.resolveBallCollision(this, enemies[i]);
      }
    }
    Ball.resolveGridCollisions(this, map.grid);
    // Update Position
    this.pos = this.pos.add(this.vel);
  };
  controlPointInteraction(map) {
    this.isCapping = 0;
    let targetControlPoints = map.getUnownedControlPoints(this.teamId);
    for (let i = 0; i < targetControlPoints.length; i++) {
      if (!targetControlPoints[i].contested
        && targetControlPoints[i].pos.getDistance(this.pos) <= ControlPoint.CAPTURE_RADIUS) {
        this.score += Player.POINTS.inControlPointRadius;
        this.isCapping = 1;
        break;
      }
    }
  };
  canAttack(gameTick) {
    if (this.attack == 1 && gameTick >= this.attackLast + this.attackCooldown) {
      return true;
    }
    return false;
  };
  takeDamage(gameTick, amount) {
    this.hp -= amount;
    if (this.hp >= this.maxHP) {
      this.hp = this.maxHP;
    } else if (this.hp <= 0) {
      this.alive = false;
      this.hp = 0;
      this.deadLast = gameTick;
    }
  };
  processVision(allies, enemies, map, gameTick) {
    // Vision Inputs
    for (let r = 0; r < Player.VISION_RAYS.length; r++) {
      let playerDir = this.direction + Player.VISION_RAYS[r];
      let maxDistance = Player.VIEW_DISTANCE;
      let currentVisionType = Player.VISION_TYPES.empty;
      // Grid
      let contactPoint = dda(
        this.pos
        ,Vector.fromAngle(playerDir)
        ,maxDistance
        ,map.grid
      );
      let distanceToWall = this.pos.getDistance(contactPoint);
      if (distanceToWall <= maxDistance) {
        currentVisionType = Player.VISION_TYPES.wall;
        maxDistance = distanceToWall;
      }
      // Allies
      for (let a = 0; a < allies.length; a++) {
        if (allies[a].alive) {
          if (this.id != allies[a].id && Ball.vsRay(
            this.pos
            ,this.pos.add(Vector.fromAngle(playerDir).mul(maxDistance))
            ,allies[a]
          )) {
            let distanceToAlly = this.pos.getDistance(allies[a].pos); // imperfect
            if (distanceToAlly <= maxDistance) {
              currentVisionType = Player.VISION_TYPES.ally;
              maxDistance = distanceToAlly;
            }
          }
        }
      }
      // Enemies
      for (let e = 0; e < enemies.length; e++) {
        if (enemies[e].alive) {
          if (Ball.vsRay(
            this.pos
            ,this.pos.add(Vector.fromAngle(playerDir).mul(maxDistance))
            ,enemies[e]
          )) {
            let distanceToEnemy = this.pos.getDistance(enemies[e].pos); // imperfect
            if (distanceToEnemy <= maxDistance) {
              currentVisionType = Player.VISION_TYPES.enemy;
              maxDistance = distanceToEnemy;
            }
          }
        }
      }
      // Control Points
      for (let c = 0; c < map.controlPoints.length; c++) {
        if (Ball.vsRay(
          this.pos
          ,this.pos.add(Vector.fromAngle(playerDir).mul(maxDistance))
          ,map.controlPoints[c]
        )) {
          let distanceToControlPoint = this.pos.getDistance(map.controlPoints[c].pos); // imperfect
          if (distanceToControlPoint <= maxDistance) {
            if (map.controlPoints[c].currentOwner == this.teamId) {
              currentVisionType = Player.VISION_TYPES.controlPointTeam;
            } else {
              currentVisionType = Player.VISION_TYPES.controlPointEnemy;
            }
            maxDistance = distanceToControlPoint;
          }
        }
      }
      // Finally, set this ray's vision type and distance
      this.visionInputs[r * 2] = currentVisionType;
      this.visionInputs[(r * 2) + 1] = Math.max(0, Math.min(maxDistance / Player.VIEW_DISTANCE, 1));
    }
    // Player Health
    this.visionInputs[(Player.VISION_RAYS.length * 2)] = this.hp / this.maxHP;
    // Is Capping a Control Point
    this.visionInputs[(Player.VISION_RAYS.length * 2) + 1] = this.isCapping;
    // Attack Cooldown
    this.visionInputs[(Player.VISION_RAYS.length * 2) + 2] = Math.max(0, Math.min(1, (gameTick - this.attackLast) / this.attackCooldown));
    // Recurrence
    this.visionInputs[(Player.VISION_RAYS.length * 2) + 3] = this.recurrence[0];
    this.visionInputs[(Player.VISION_RAYS.length * 2) + 4] = this.recurrence[1];
    // Bias of 1
    this.visionInputs[(Player.VISION_RAYS.length * 2) + 5] = 1;
  };
};
