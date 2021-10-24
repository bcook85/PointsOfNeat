'use strict';

class Bullet extends Ball {
  constructor(ownerId, position, direction, image) {
    super(position, 0.125);

    // Stats
    this.ownerId = ownerId;
    this.alive = true;
    this.damage = 35;

    // Image
    this.image = image;

    // Position
    this.direction = direction;
    this.moveSpeed = 0.6;
    this.vel = Vector.fromAngle(this.direction).normalize().mul(this.moveSpeed);
  };
  render(ctx, offset, scale) {
    ctx.save();
    // Move to Draw Position
    ctx.translate(
      Math.floor((this.pos.x * scale) + offset.x)
      ,Math.floor((this.pos.y * scale) + offset.y)
    );
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
  update() {
    // Update Position
    this.pos = this.pos.add(this.vel);
  };
};
