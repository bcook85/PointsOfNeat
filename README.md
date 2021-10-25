# PointsOfNeat
Neural Network learns to play Capture The Points using NEAT.

# Try It
https://bcook85.github.io/PointsOfNeat/game.html

# The Game
Teams compete to take and maintain ownership of 5 control points across the map.
Both teams consist of 5 players, each controlled by their own population of neural networks.
Teams have 30 seconds per group to capture and hold as many control points as possible.
Players are scored based on: Damage to enemies, time spent capturing, exploration, and being alive.
As the user, you can toggle 10x Speed mode, toggle player vision, and save the current generation of NEATs.

# Neural Network & NEAT
This game uses Neuroevolution with Augmenting Topologies (NEAT) to evolve a population of neural networks.
Each population contains 100 "brains", all evolving as one species. Games are played in groups, one for each in the population.
Each brain group is allowed to play the game once and its performance is scored.
Once every brain in the population has played and been scored, fitness is calculated and a new generation of brains is created.
Each neural network has 27 inputs, a hidden layer of 17, a hidden layer of 10, and finally 9 outputs.
Player vision consists of 11 casted rays spread out in a 180 degree field of view.

# Map Editor
A map editor is included. The neural networks do not distinguish between tiles, only collision or no collision.
Right clicking on a tile in the map editor allows you to toggle collision for that tile.
Clicking the Reset button will reset the map back to the default map.
Saved maps are stored in your browser's localStorage.
Saved maps in localStorage will override the default map when the game is started.

# Saving NEATs
A save button is provided on the game screen. When clicked, it will open a save file dialog to download a copy of the current generation of all NEAT populations. Only the layers of the neural networks are saved- not scores or current group. Saving the same generation will produce an identical file.
On the start screen, clicking Load Sim will allow you to upload this file back into the game and continue (at group 1) the generation you were on previously.