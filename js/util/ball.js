'use strict';

class Ball {
  static count = -Number.MAX_SAFE_INTEGER;
  constructor(pos, radius) {
    this.pos = new Vector(pos.x, pos.y);
    this.radius = radius;
    this.vel = new Vector(0, 0);
    this.hasCollision = true;
    this.id = ++Ball.count;
  };
  vsVector(vec) {
    return Math.abs(((vec.x - this.x) * (vec.x - this.x)) + ((vec.y - this.y) * (vec.y - this.y))) < this.radius * this.radius;
  };
  vsBall(ball) {
    if (ball.hasCollision) {
      let diff = ball.pos.sub(this.pos);
      if (Math.abs((diff.x * diff.x) + (diff.y * diff.y)) <= (this.radius + ball.radius) * (this.radius + ball.radius)) {
        return true;
      }
    }
    return false;
  };
  vsCircle(pos, radius) {
    let diff = pos.sub(this.pos);
    if (Math.abs((diff.x * diff.x) + (diff.y * diff.y)) <= (this.radius + radius) * (this.radius + radius)) {
      return true;
    }
    return false;
  };
  static vsRay(startPoint, endPoint, targetBall) {
    let v1 = endPoint.sub(startPoint);
    let v2 = targetBall.pos.sub(startPoint);
    let u = (v2.x * v1.x + v2.y * v1.y) / (v1.y * v1.y + v1.x * v1.x);
    let dist = 0;
    if (u >= 0 && u <= 1) {
      dist = (startPoint.x + v1.x * u - targetBall.pos.x) ** 2 + (startPoint.y + v1.y * u - targetBall.pos.y) ** 2;
    } else {
      dist = u < 0 ?
        (startPoint.x - targetBall.pos.x) ** 2 + (startPoint.y - targetBall.pos.y) ** 2 :
        (endPoint.x - targetBall.pos.x) ** 2 + (endPoint.y - targetBall.pos.y) ** 2;
    }
    return dist < targetBall.radius * targetBall.radius;
  };
  static resolveBallCollision(ball, target) {
    let potentialPosition = ball.pos.add(ball.vel);
    if (target.id != ball.id && target.hasCollision && target.vsCircle(potentialPosition, ball.radius)) {
      let distanceBetween = Math.hypot(target.pos.x - potentialPosition.x, target.pos.y - potentialPosition.y);
      let overlap = (distanceBetween - ball.radius - target.radius);
      potentialPosition = potentialPosition.sub(potentialPosition.sub(target.pos).mul(overlap).div(distanceBetween));
      ball.vel = Vector.fromAngle(ball.pos.getAngle(potentialPosition)).normalize().mul(ball.pos.getDistance(potentialPosition));
    }
  };
  static resolveBallCollisions(ball, balls) {
    for (let i = 0; i < balls.length; i++) {
      let potentialPosition = ball.pos.add(ball.vel);
      if (balls[i].id != ball.id && balls[i].hasCollision && balls[i].vsCircle(potentialPosition, ball.radius)) {
        let distanceBetween = Math.hypot(balls[i].pos.x - potentialPosition.x, balls[i].pos.y - potentialPosition.y);
        let overlap = (distanceBetween - ball.radius - balls[i].radius);
        potentialPosition = potentialPosition.sub(potentialPosition.sub(balls[i].pos).mul(overlap).div(distanceBetween));
        ball.vel = Vector.fromAngle(ball.pos.getAngle(potentialPosition)).normalize().mul(ball.pos.getDistance(potentialPosition));
      }
    }
  };
  static resolveGridCollisions(ball, grid) {
    let potentialPosition = ball.pos.add(ball.vel);
    let currentCell = new Vector(Math.floor(ball.pos.x), Math.floor(ball.pos.y));
    let targetCell = potentialPosition;
    let areaTL = new Vector(Math.floor(Math.min(currentCell.x, targetCell.x) - 1), Math.floor(Math.min(currentCell.y, targetCell.y)) - 1);
    let areaBR = new Vector(Math.floor(Math.max(currentCell.x, targetCell.x) + 1), Math.floor(Math.max(currentCell.y, targetCell.y)) + 1);
    let cell = new Vector(0, 0);
    for (cell.y = areaTL.y; cell.y <= areaBR.y; cell.y++) {
      for (cell.x = areaTL.x; cell.x <= areaBR.x; cell.x++) {
        if (cell.x < 0 || cell.y < 0
          || cell.x >= grid.length || cell.y >= grid[cell.x].length
          || grid[cell.x][cell.y] != 0) {
          potentialPosition = ball.pos.add(ball.vel);
          let near = new Vector(
            Math.max(cell.x, Math.min(potentialPosition.x, cell.x + 1))
            ,Math.max(cell.y, Math.min(potentialPosition.y, cell.y + 1))
          );
          let rayToNear = near.sub(potentialPosition);
          if (rayToNear.x == 0 && rayToNear.y == 0) {
            potentialPosition = potentialPosition.sub(ball.vel.normalize().mul(ball.radius));
          } else {
            let overlap = ball.radius - rayToNear.mag();
            if (!isNaN(overlap) && overlap > 0) {
              potentialPosition = potentialPosition.sub(rayToNear.normalize().mul(overlap));
            }
          }
          ball.vel = Vector.fromAngle(ball.pos.getAngle(potentialPosition)).normalize().mul(ball.pos.getDistance(potentialPosition));
        }
      }
    }
  };
  static collidesBalls(ball, balls) {
    for (let i = 0; i < balls.length; i++) {
      let potentialPosition = ball.pos.add(ball.vel);
      if (balls[i].id != ball.id && balls[i].hasCollision && balls[i].vsCircle(potentialPosition, ball.radius)) {
        return true;
      }
    }
    return false;
  };
  static collidesGrid(ball, grid) {
    let areaTL = new Vector(
      Math.floor(ball.pos.x - ball.radius) - 1
      ,Math.floor(ball.pos.y - ball.radius) - 1
    );
    let areaBR = new Vector(
      Math.ceil(ball.pos.x + ball.radius) + 1
      ,Math.ceil(ball.pos.y + ball.radius) + 1
    );
    let cell = new Vector(0, 0);
    for (cell.y = areaTL.y; cell.y <= areaBR.y; cell.y++) {
      for (cell.x = areaTL.x; cell.x <= areaBR.x; cell.x++) {
        if (cell.x < 0 || cell.y < 0
          || cell.x >= grid.length || cell.y >= grid[cell.x].length
          || grid[cell.x][cell.y] != 0) {
          let near = new Vector(
            Math.max(cell.x, Math.min(ball.pos.x, cell.x + 1))
            ,Math.max(cell.y, Math.min(ball.pos.y, cell.y + 1))
          );
          let rayToNear = near.sub(ball.pos);
          if (rayToNear.x == 0 && rayToNear.y == 0) {
            return true;
          } else {
            let overlap = ball.radius - rayToNear.mag();
            if (!isNaN(overlap) && overlap > 0) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };
};