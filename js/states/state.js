'use strict';

class State {
	constructor(screenSize, keyManager, mouse) {
		// Screen Size
		this.screenSize = new Vector(screenSize.x, screenSize.y);
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