'use strict';

class SoundContainer {
  constructor() {
    this.sounds = [];
  };
  load(file, channels, volume=1.0) {
    let channel = new SoundChannel(file, channels, volume);
    this.sounds.push(channel);
  };
  play(id, volume=1.0) {
    let sound = this.get(id);
    if (sound !== undefined) {
      sound.volume = volume * sound.defaultVolume;
      sound.currentTime = 0;
      sound.play();
    }
  };
  get(id) {
    if (id >= 0 && id < this.sounds.length) {
      return this.sounds[id].getPlayable();
    }
    return undefined;
  };
};
