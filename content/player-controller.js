// Player Controller - Direct video control
export class PlayerController {
  constructor() {
    this.video = document.querySelector('video');
    if (!this.video) {
      throw new Error('Video element not found');
    }
    console.log('[PlayerController] Initialized');
  }

  // Playback controls
  play() {
    this.video.play();
    console.log('[PlayerController] Play');
    return true;
  }

  pause() {
    this.video.pause();
    console.log('[PlayerController] Pause');
    return true;
  }

  togglePlayPause() {
    if (this.video.paused) {
      this.play();
    } else {
      this.pause();
    }
    return true;
  }

  // Time controls
  getCurrentTime() {
    return this.video.currentTime;
  }

  getDuration() {
    return this.video.duration;
  }

  seek(seconds) {
    this.video.currentTime = Math.max(0, Math.min(seconds, this.video.duration));
    console.log('[PlayerController] Seek to', seconds);
    return true;
  }

  skip(seconds) {
    const newTime = this.video.currentTime + seconds;
    this.seek(newTime);
    console.log('[PlayerController] Skip', seconds);
    return true;
  }

  rewind(seconds) {
    this.skip(-seconds);
    console.log('[PlayerController] Rewind', seconds);
    return true;
  }

  // Speed controls
  getPlaybackRate() {
    return this.video.playbackRate;
  }

  setPlaybackRate(rate) {
    this.video.playbackRate = Math.max(0.25, Math.min(2.0, rate));
    console.log('[PlayerController] Speed set to', rate);
    return true;
  }

  increaseSpeed() {
    const newRate = Math.min(2.0, this.video.playbackRate + 0.25);
    this.setPlaybackRate(newRate);
    return newRate;
  }

  decreaseSpeed() {
    const newRate = Math.max(0.25, this.video.playbackRate - 0.25);
    this.setPlaybackRate(newRate);
    return newRate;
  }

  normalSpeed() {
    this.setPlaybackRate(1.0);
    return true;
  }

  // Volume controls
  getVolume() {
    return this.video.volume;
  }

  setVolume(volume) {
    this.video.volume = Math.max(0, Math.min(1, volume));
    console.log('[PlayerController] Volume set to', volume);
    return true;
  }

  mute() {
    this.video.muted = true;
    console.log('[PlayerController] Muted');
    return true;
  }

  unmute() {
    this.video.muted = false;
    console.log('[PlayerController] Unmuted');
    return true;
  }

  // Utility
  isPlaying() {
    return !this.video.paused;
  }

  isMuted() {
    return this.video.muted;
  }

  getStatus() {
    return {
      playing: this.isPlaying(),
      currentTime: this.getCurrentTime(),
      duration: this.getDuration(),
      playbackRate: this.getPlaybackRate(),
      volume: this.getVolume(),
      muted: this.isMuted()
    };
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlayerController };
}
