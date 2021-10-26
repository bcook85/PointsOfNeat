'use strict';

class State {
	constructor() {
		// Empty
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