'use strict';

class Neuron {
  constructor(size) {
    this.weights = [];
    for (let i = 0; i < size; i++) {
      this.weights.push((Math.random() * 2) - 1);
    }
    this.bias = (Math.random() * 2) - 1;
  };
  calculateSignal(inputs) {
    let sum = 0;
    for (let i = 0; i < this.weights.length; i++) {
      sum += inputs[i] * this.weights[i];
    }
    return sum + this.bias;
  };
};
