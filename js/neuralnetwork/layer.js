'use strict';

class Layer {
  constructor(nCount, wCount) {
    this.neurons = [];
    for (let i = 0; i < nCount; i++) {
      this.neurons.push(new Neuron(wCount));
    }
  };
  feedNeurons(inputs) {
    let output = [];
    for (let i = 0; i < this.neurons.length; i++) {
      output.push(this.neurons[i].calculateSignal(inputs));
    }
    return output;
  };
};
