'use strict';

class StateManager {
	static currentState = undefined;
    static states = {};
    static addState(state, name) {
        StateManager.states[name] = state;
    };
	static setState(name) {
		StateManager.currentState = StateManager.states[name];
	};
	static getState() {
		return StateManager.currentState;
	};
};
