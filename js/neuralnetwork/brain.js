'use strict';

class Brain {
  constructor(dimensions) {
    this.layers = [];
    this.score = 0;
    for (let i = 1; i < dimensions.length; i++) {
      this.layers.push(new Layer(dimensions[i], dimensions[i - 1]));
    }
  };
  static sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  };
  static rectifiedLinear(x) {
    return x <= 0 ? 0 : x;
  };
  feedForward_Combo(inputs) {
    for (let i = 0; i < this.layers.length; i++) {
      inputs = this.layers[i].feedNeurons(inputs);
      for (let j = 0; j < inputs.length; j++) {
        if (i < this.layers.length - 1) {
          inputs[j] = Brain.rectifiedLinear(inputs[j]);
        } else {
          inputs[j] = Brain.sigmoid(inputs[j]);
        }
      }
    }
    return inputs;
  };
  feedForward_RELU(inputs) {
    for (let i = 0; i < this.layers.length; i++) {
      inputs = this.layers[i].feedNeurons(inputs);
      for (let j = 0; j < inputs.length; j++) {
        inputs[j] = Brain.rectifiedLinear(inputs[j]);
      }
    }
    return inputs;
  };
  feedForward_Sigmoid(inputs) {
    for (let i = 0; i < this.layers.length; i++) {
      inputs = this.layers[i].feedNeurons(inputs);
      for (let j = 0; j < inputs.length; j++) {
        inputs[j] = Brain.sigmoid(inputs[j]);
      }
    }
    return inputs;
  };
};
