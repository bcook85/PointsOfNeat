'use strict';

// Digital Differential Analyzer

function dda(rayOrigin, rayDir, searchDistance, grid) {
  let rayNorm = rayDir.normalize();
  let rayUnitStepSize = new Vector(
    Math.sqrt(1 + ((rayNorm.y / rayNorm.x) * (rayNorm.y / rayNorm.x)))
    ,Math.sqrt(1 + ((rayNorm.x / rayNorm.y) * (rayNorm.x / rayNorm.y)))
  );
  let mapCheck = new Vector(
    Math.floor(rayOrigin.x)
    ,Math.floor(rayOrigin.y)
  );
  let rayLength = new Vector(0, 0);
  let step = new Vector(0, 0);
  // Starting Condition Check, prime ray length
  if (rayNorm.x < 0) {
    step.x = -1;
    rayLength.x = (rayOrigin.x - mapCheck.x) * rayUnitStepSize.x;
  } else {
    step.x = 1;
    rayLength.x = (mapCheck.x + 1 - rayOrigin.x) * rayUnitStepSize.x;
  }
  if (rayNorm.y < 0) {
    step.y = -1;
    rayLength.y = (rayOrigin.y - mapCheck.y) * rayUnitStepSize.y;
  } else {
    step.y = 1;
    rayLength.y = (mapCheck.y + 1 - rayOrigin.y) * rayUnitStepSize.y;
  }
  let tileFound = false;
  let dist = 0;
  while(!tileFound && dist < searchDistance) {
    if (rayLength.x < rayLength.y) {
      mapCheck.x += step.x;
      dist = rayLength.x;
      rayLength.x += rayUnitStepSize.x;
    } else {
      mapCheck.y += step.y;
      dist = rayLength.y;
      rayLength.y += rayUnitStepSize.y;
    }
    if (mapCheck.x < 0 || mapCheck.y < 0
      || mapCheck.x >= grid.length || mapCheck.y >= grid[mapCheck.x].length
      || grid[mapCheck.x][mapCheck.y] != 0) {
      tileFound = true;
    }
  }
  if (tileFound && dist < searchDistance) {
    return rayOrigin.add(rayNorm.mul(dist));
  }
  return rayOrigin.add(rayNorm.mul(searchDistance));
}