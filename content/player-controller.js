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
    // Check if video is ready and duration is valid
    if (!this.video || isNaN(this.video.duration) || !isFinite(this.video.duration)) {
      console.warn('[PlayerController] Video not ready or invalid duration');
      return false;
    }
    
    const targetTime = Math.max(0, Math.min(seconds, this.video.duration));
    if (!isFinite(targetTime)) {
      console.error('[PlayerController] Invalid target time:', targetTime);
      return false;
    }
    
    this.video.currentTime = targetTime;
    console.log('[PlayerController] Seek to', targetTime);
    return true;
  }

  skip(seconds) {
    if (!this.video || isNaN(this.video.currentTime)) {
      console.warn('[PlayerController] Video not ready for skip');
      return false;
    }
    
    const newTime = this.video.currentTime + seconds;
    const result = this.seek(newTime);
    if (result) {
      console.log('[PlayerController] Skip', seconds);
    }
    return result;
  }

  rewind(seconds) {
    const result = this.skip(-seconds);
    if (result) {
      console.log('[PlayerController] Rewind', seconds);
    }
    return result;
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
