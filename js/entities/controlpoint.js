'use strict';

class ControlPoint extends Ball {

  static POINT_VALUE = 1;
  static CAPTURE_RADIUS = 1.5;

  constructor(position, neutralImage, redTeamImage, blueTeamImage) {
    super(position, 0.25);
    this.neutralImage = neutralImage;
    this.redTeamImage = redTeamImage;
    this.blueTeamImage = blueTeamImage;
    this.currentOwner = GameState.TEAM_ID.neutral;
    this.cappingTeam = GameState.TEAM_ID.neutral;

    this.captureAmount = 0;
    this.redCaptureAmount = 0;
    this.blueCaptureAmount = 0;
    this.captureAmountPerTick = 0.034;
    this.captureTickTime = 6;
    this.captureLast = 0;
  };
  render(ctx, offset, scale) {
    ctx.save();
    // Move to Draw Position
    ctx.translate(
      Math.floor((this.pos.x * scale) + offset.x)
      ,Math.floor((this.pos.y * scale) + offset.y)
    );
    // Draw Current Image
    switch (this.currentOwner) {
      case GameState.TEAM_ID.red:
        ctx.drawImage(
          this.redTeamImage
          ,0 ,0
          ,this.redTeamImage.width, this.redTeamImage.height
          ,Math.floor(scale * -0.5), Math.floor(scale * -0.75)
          ,Math.floor(scale), Math.floor(scale)
        );
        break;
      case GameState.TEAM_ID.blue:
        ctx.drawImage(
          this.blueTeamImage
          ,0 ,0
          ,this.blueTeamImage.width, this.blueTeamImage.height
          ,Math.floor(scale * -0.5), Math.floor(scale * -0.75)
          ,Math.floor(scale), Math.floor(scale)
        );
        break;
      case GameState.TEAM_ID.neutral:
        ctx.drawImage(
          this.neutralImage
          ,0 ,0
          ,this.neutralImage.width, this.neutralImage.height
          ,Math.floor(scale * -0.5), Math.floor(scale * -0.75)
          ,Math.floor(scale), Math.floor(scale)
        );
        // Control Bar
        if (this.cappingTeam != GameState.TEAM_ID.neutral) {
          ctx.fillStyle = "rgb(0,0,0)";
          ctx.fillRect(
            Math.floor(scale * -0.25)
            ,Math.floor(scale * -1.125)
            ,Math.floor(scale * 0.5)
            ,Math.floor(scale * 0.125)
          );
          let capAmount = 0;
          if (this.cappingTeam == GameState.TEAM_ID.red) {
            ctx.fillStyle = "rgb(255,0,0)";
            capAmount = this.redCaptureAmount;
          } else if (this.cappingTeam == GameState.TEAM_ID.blue) {
            ctx.fillStyle = "rgb(0,0,255)";
            capAmount = this.blueCaptureAmount;
          }
          ctx.fillRect(
            Math.floor(scale * -0.25)
            ,Math.floor(scale * -1.125)
            ,Math.floor(scale * 0.5 * capAmount)
            ,Math.floor(scale * 0.125)
          );
        }
        break;
    }
    ctx.restore();
  };
  update(redTeamCapping, blueTeamCapping) {
    switch (this.currentOwner) {
      case GameState.TEAM_ID.red:
        if (blueTeamCapping && !redTeamCapping) {
          this.redCaptureAmount -= this.captureAmountPerTick;
          if (this.redCaptureAmount <= 0) {
            this.redCaptureAmount = 0;
            this.blueCaptureAmount = 0;
            this.currentOwner = GameState.TEAM_ID.neutral;
          }
        }
        break;
      case GameState.TEAM_ID.blue:
        if (redTeamCapping && !blueTeamCapping) {
          this.blueCaptureAmount -= this.captureAmountPerTick;
          if (this.blueCaptureAmount <= 0) {
            this.blueCaptureAmount = 0;
            this.redCaptureAmount = 0;
            this.currentOwner = GameState.TEAM_ID.neutral;
          }
        }
        break;
      case GameState.TEAM_ID.neutral:
        if (redTeamCapping && !blueTeamCapping) {
          this.redCaptureAmount += this.captureAmountPerTick;
          this.cappingTeam = GameState.TEAM_ID.red;
          if (this.redCaptureAmount >= 1) {
            this.currentOwner = GameState.TEAM_ID.red;
            this.cappingTeam = GameState.TEAM_ID.neutral;
            this.redCaptureAmount = 1;
            this.blueCaptureAmount = 0;
          }
        } else if (blueTeamCapping && !redTeamCapping) {
          this.blueCaptureAmount += this.captureAmountPerTick;
          this.cappingTeam = GameState.TEAM_ID.blue;
          if (this.blueCaptureAmount >= 1) {
            this.currentOwner = GameState.TEAM_ID.blue;
            this.cappingTeam = GameState.TEAM_ID.neutral;
            this.blueCaptureAmount = 1;
            this.redCaptureAmount = 0;
          }
        }
        break;
    }    
  };
  reset() {
    this.captureLast = -Infinity;
    this.redCaptureAmount = 0;
    this.blueCaptureAmount = 0;
    this.currentOwner = GameState.TEAM_ID.neutral;
    this.cappingTeam = GameState.TEAM_ID.neutral;
  };
};
