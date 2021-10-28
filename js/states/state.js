'use strict';

class State {
	constructor(keyManager, mouse) {
		// Input
		this.keys = keyManager;
		this.mouse = mouse;
	}

	init() {
		// To Be Overriden
	};

	render(ctx) {
		// To Be Overriden
	};

	update(gameTick) {
		// To Be Overriden
	};
};