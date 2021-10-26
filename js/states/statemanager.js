'use strict';

class StateManager {

	static currentState = undefined;
  static states = {};
  static initialState = undefined;

  static init(keys, mouse) {
    // Define States
    StateManager.states = {
      "start": new StartState(keys, mouse)
      ,"editor": new EditorState(keys, mouse)
      ,"game": new GameState(keys, mouse)
    };
    StateManager.initialState = StateManager.states.start;
  };

  static setInitialState() {
    StateManager.setState(StateManager.initialState);
  };

	static setState(state) {
		StateManager.currentState = state;
    StateManager.currentState.init();
	};

	static getState() {
		return StateManager.currentState;
	};
};
