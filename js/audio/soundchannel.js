'use strict';

class SoundChannel {
  constructor(file, channels, volume) {
    this.channels = [];
    this.volume = volume;
    for (let i = 0; i < channels; i++) {
      let sound = new Audio();
      sound.src = file;
      sound.volume = volume;
      sound.defaultVolume = volume;
      this.channels.push(sound);
    }
    console.log(`Sound Loaded: ${file} x ${channels} @ ${volume * 100}%`);
  };
  getPlayable() {
    for (let sound of this.channels) {
      if (sound.readyState === 4
        && (sound.currentTime == 0 || sound.currentTime >= sound.duration)) {
        return sound;
      }
    }
    return undefined;
  };
};
