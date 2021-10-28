'use strict';

class Neat {
  constructor(populationSize, dimensions) {
    this.populationSize = populationSize;
    this.dimensions = dimensions;
    this.mutationChance = 0.001;
    this.mutationAmount = 0.01;
    this.mutationCritical = 0.00001;
    this.generation = 0;
    this.pickTop1 = 0.1;
    this.pickTop2 = 0.5;
    this.brains = [];
    for (let i = 0; i < this.populationSize; i++) {
      this.brains.push(new Brain(this.dimensions));
    }
  };
  setBrainScore(brainId, score) {
    if (brainId >= 0 && brainId < this.brains.length) {
      this.brains[brainId].score = score;
    }
  };
  processInput(brainId, input) {
    if (brainId < 0 || brainId >= this.brains.length
      || input.length !== this.dimensions[0])
    {
      return undefined;
    }
    return this.brains[brainId].feedForward_Combo(input);
  };
  calculateFitness() {
		let sum = 0;
		for (let i = 0; i < this.brains.length; i++) {
			sum += this.brains[i].score;
		}
		for (let i = 0; i < this.brains.length; i++) {
			this.brains[i].fitness = this.brains[i].score / sum;
		}
	};
  nextGeneration() {
    this.calculateFitness();
    let newBrains = [];
    for (let i = 0; i < this.brains.length; i++) {
      let newBrain = this.crossover(
        this.brains[this.pickOne()]
        ,this.brains[this.pickOne()]
      );
      this.mutateBrain(newBrain);
      newBrains.push(newBrain);
    }
    this.brains = newBrains;
    this.generation += 1;
  };
  pickOne() {
		let index = 0;
		let r = Math.random();
		while (r > 0) {
      r = r - this.brains[index].fitness;
      index += 1;
		}
		index -= 1;
		return index;
	};
  crossover(brain1, brain2) {
    let newBrain = new Brain(this.dimensions);
    for (let i = 0; i < newBrain.layers.length; i++) {
      for (let j = 0; j < newBrain.layers[i].neurons.length; j++) {
        for (let k = 0; k < newBrain.layers[i].neurons[j].weights.length; k++) {
          if (Math.random() <= 0.5) {
            newBrain.layers[i].neurons[j].weights[k] = brain1.layers[i].neurons[j].weights[k];
          } else {
            newBrain.layers[i].neurons[j].weights[k] = brain2.layers[i].neurons[j].weights[k];
          }
        }
        if (Math.random() <= 0.5) {
          newBrain.layers[i].neurons[j].bias = brain1.layers[i].neurons[j].bias;
        } else {
          newBrain.layers[i].neurons[j].bias = brain2.layers[i].neurons[j].bias;
        }
      }
    }
    return newBrain;
  };
  mutateBrain(brain) {
    for (let i = 0; i < brain.layers.length; i++) {
      for (let j = 0; j < brain.layers[i].neurons.length; j++) {
        // Weights
        for (let k = 0; k < brain.layers[i].neurons[j].weights.length; k++) {
          this.mutateValue(brain.layers[i].neurons[j].weights[k]);
        }
        // bias
        this.mutateValue(brain.layers[i].neurons[j].bias);
      }
    }
  };
  mutateValue(value) {
    if (Math.random() <= this.mutationCritical) {
      value = (Math.random() * 2) - 1;
    } else if (Math.random() <= this.mutationChance) {
      if (Math.random() <= 0.5) {
        value += this.mutationAmount;
        if (value > 1) {
          value = 1;
        }
      } else {
        value -= this.mutationAmount;
        if (value < -1) {
          value = -1;
        }
      }
    }
  };
  save() {
    let savedBrains = [];
    for (let i = 0; i < this.brains.length; i++) {
      let layers = [];
      for (let j = 0; j < this.brains[i].layers.length; j++) {
        let layer = [];
        for (let k = 0; k < this.brains[i].layers[j].neurons.length; k++) {
          let weights = [];
          for (let l = 0; l < this.brains[i].layers[j].neurons[k].weights.length; l++) {
            weights.push(this.brains[i].layers[j].neurons[k].weights[l]);
          }
          layer.push([weights, this.brains[i].layers[j].neurons[k].bias]);
        }
        layers.push(layer);
      }
      savedBrains.push(layers);
    }
    return savedBrains;
  };
  load(neatData) {
    for (let i = 0; i < neatData.length; i++) {
      for (let j = 0; j < neatData[i].length; j++) {
        for (let k = 0; k < neatData[i][j].length; k++) {
          for (let l = 0; l < neatData[i][j][k][0].length; l++) {
            this.brains[i].layers[j].neurons[k].weights[l] = neatData[i][j][k][0][l];
          }
          this.brains[i].layers[j].neurons[k].bias = neatData[i][j][k][1];
        }
      }
    }
  };
};
