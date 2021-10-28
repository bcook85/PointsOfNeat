'use strict';

class StateManager {

	static currentState = undefined;
  static states = {};

	static setState(state) {
		StateManager.currentState = state;
    StateManager.currentState.init();
	};

	static getState() {
		return StateManager.currentState;
	};

  static init(screenSize, keys, mouse) {
    // Define States
    StateManager.states = {
      "load": new LoadState(screenSize, keys, mouse)
      ,"start": new StartState(screenSize, keys, mouse)
      ,"editor": new EditorState(screenSize, keys, mouse)
      ,"game": new GameState(screenSize, keys, mouse)
    };
    // Set Initial State
    StateManager.setState(StateManager.states.load);
  };
};
