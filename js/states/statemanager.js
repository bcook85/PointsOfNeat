'use strict';

class StateManager {

	static currentState = undefined;
  static states = {};

  static init(keys, mouse) {
    // Define States
    StateManager.states = {
      "load": new LoadState(keys, mouse)
      ,"start": new StartState(keys, mouse)
      ,"editor": new EditorState(keys, mouse)
      ,"game": new GameState(keys, mouse)
    };
    // Set Initial State
    StateManager.setState(StateManager.states.load);
  };

	static setState(state) {
		StateManager.currentState = state;
    StateManager.currentState.init();
	};

	static getState() {
		return StateManager.currentState;
	};
};
