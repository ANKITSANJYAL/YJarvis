import { CONFIG, PLAYBACK_SPEEDS } from '../constants/config';
import { logger } from '../utils/logger';

type ParsedCommand =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'RESTART' }
  | { type: 'SEEK'; seconds: number }
  | { type: 'SEEK_TO'; seconds: number }
  | { type: 'SEEK_PERCENT'; percent: number }
  | { type: 'VOLUME_SET'; value: number }
  | { type: 'VOLUME_CHANGE'; delta: number }
  | { type: 'MUTE' }
  | { type: 'UNMUTE' }
  | { type: 'SPEED_SET'; speed: number }
  | { type: 'SPEED_CHANGE'; delta: number }
  | { type: 'FULLSCREEN' }
  | { type: 'EXIT_FULLSCREEN' }
  | { type: 'THEATER_MODE' }
  | { type: 'CAPTIONS_TOGGLE' }
  | { type: 'NEXT_VIDEO' }
  | { type: 'PREV_VIDEO' };

function getPlayer(): HTMLVideoElement | null {
  return document.querySelector('video.html5-main-video');
}

function getYouTubeButton(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

function clickButton(selector: string): boolean {
  const btn = getYouTubeButton(selector);
  if (btn) {
    btn.click();
    return true;
  }
  return false;
}

function safeAction(action: () => void): void {
  try {
    action();
  } catch (e) {
    logger.warn('YouTube controller action failed', { error: e });
  }
}

function parse(text: string): ParsedCommand | null {
  const t = text.toLowerCase().trim();
  
  // Stop (pause + restart)
  if (/\bstop\b/.test(t) && !/don't stop|do not stop/.test(t)) {
    return { type: 'STOP' };
  }
  
  // Pause
  if (/\bpause\b|\bhold\b/.test(t)) {
    return { type: 'PAUSE' };
  }
  
  // Play/Resume
  if (/\b(play|resume|start|continue)\b/.test(t)) {
    return { type: 'PLAY' };
  }
  
  // Restart
  if (/\b(restart|replay|start over|from the beginning)\b/.test(t)) {
    return { type: 'RESTART' };
  }
  
  // Seek to specific time
  const timeMatch = t.match(/(?:go to|jump to|seek to)\s*(?:(\d+)\s*(?:hour|hr)s?\s*)?(?:(\d+)\s*(?:minute|min)s?\s*)?(?:(\d+)\s*(?:second|sec)s?)?/i);
  if (timeMatch) {
    const hours = Number(timeMatch[1] || 0);
    const minutes = Number(timeMatch[2] || 0);
    const seconds = Number(timeMatch[3] || 0);
    return { type: 'SEEK_TO', seconds: hours * 3600 + minutes * 60 + seconds };
  }
  
  // Seek to percentage
  const percentMatch = t.match(/(?:go to|jump to)\s*(\d+)\s*%/i);
  if (percentMatch) {
    return { type: 'SEEK_PERCENT', percent: Number(percentMatch[1]) };
  }
  
  // Skip forward/backward
  const skipMatch = t.match(/(forward|ahead|skip|back|backward|rewind)\s*(?:by\s*)?(\d+)\s*(second|sec|minute|min)s?/i);
  if (skipMatch && skipMatch[1] && skipMatch[2] && skipMatch[3]) {
    const amount = Number(skipMatch[2]);
    const unit = skipMatch[3];
    const seconds = unit.startsWith('min') ? amount * 60 : amount;
    const isForward = /forward|ahead|skip/.test(skipMatch[1]);
    return { type: 'SEEK', seconds: isForward ? seconds : -seconds };
  }
  
  // Volume set
  const volSetMatch = t.match(/(?:set|change)?\s*volume\s*(?:to|at)?\s*(\d{1,3})\s*%?/i);
  if (volSetMatch) {
    return { type: 'VOLUME_SET', value: Math.min(100, Math.max(0, Number(volSetMatch[1]))) };
  }
  
  // Volume up/down
  if (/\b(increase|raise|turn up|louder)\s*(?:volume)?/.test(t)) {
    return { type: 'VOLUME_CHANGE', delta: CONFIG.VOLUME_INCREMENT };
  }
  if (/\b(decrease|lower|turn down|quieter)\s*(?:volume)?/.test(t)) {
    return { type: 'VOLUME_CHANGE', delta: -CONFIG.VOLUME_INCREMENT };
  }
  
  // Mute/Unmute
  if (/\bmute\b/.test(t) && !/unmute/.test(t)) {
    return { type: 'MUTE' };
  }
  if (/\bunmute\b/.test(t)) {
    return { type: 'UNMUTE' };
  }
  
  // Speed controls
  const speedSetMatch = t.match(/(?:set|change)?\s*(?:playback\s*)?speed\s*(?:to|at)?\s*(\d+\.?\d*)\s*x?/i);
  if (speedSetMatch) {
    const speed = Number(speedSetMatch[1]);
    if (speed >= CONFIG.SPEED_MIN && speed <= CONFIG.SPEED_MAX) {
      return { type: 'SPEED_SET', speed };
    }
  }
  
  if (/\bnormal\s*speed\b/.test(t)) {
    return { type: 'SPEED_SET', speed: 1.0 };
  }
  
  if (/\b(speed up|faster|increase speed)\b/.test(t)) {
    return { type: 'SPEED_CHANGE', delta: CONFIG.SPEED_INCREMENT };
  }
  
  if (/\b(slow down|slower|decrease speed)\b/.test(t)) {
    return { type: 'SPEED_CHANGE', delta: -CONFIG.SPEED_INCREMENT };
  }
  
  // Fullscreen
  if (/\b(fullscreen|full screen|maximize)\b/.test(t) && !/exit/.test(t)) {
    return { type: 'FULLSCREEN' };
  }
  if (/\b(exit fullscreen|exit full screen|minimize)\b/.test(t)) {
    return { type: 'EXIT_FULLSCREEN' };
  }
  
  // Theater mode
  if (/\b(theater|theatre)\s*mode\b/.test(t) && !/exit/.test(t)) {
    return { type: 'THEATER_MODE' };
  }
  
  // Captions
  if (/\b(caption|subtitle|cc)\b/.test(t)) {
    return { type: 'CAPTIONS_TOGGLE' };
  }
  
  // Next/Previous video
  if (/\b(next)\s*(?:video|track)?\b/.test(t)) {
    return { type: 'NEXT_VIDEO' };
  }
  if (/\b(previous|prev|back|last)\s*(?:video|track)?\b/.test(t)) {
    return { type: 'PREV_VIDEO' };
  }
  
  return null;
}

function clampSpeed(speed: number): number {
  const valid = PLAYBACK_SPEEDS;
  const clamped = Math.max(CONFIG.SPEED_MIN, Math.min(CONFIG.SPEED_MAX, speed));
  // Find closest valid speed
  return valid.reduce((prev, curr) => 
    Math.abs(curr - clamped) < Math.abs(prev - clamped) ? curr : prev
  );
}

export const youtubeController = {
  init(): void {
    logger.info('YouTube controller initialized');
  },
  
  handleCommand(input: string): boolean {
    const cmd = parse(input);
    if (!cmd) return false;
    
    const player = getPlayer();
    if (!player && !['NEXT_VIDEO', 'PREV_VIDEO'].includes(cmd.type)) {
      logger.warn('No video player found');
      return false;
    }
    
    safeAction(() => {
      switch (cmd.type) {
        case 'PLAY':
          player?.play();
          break;
          
        case 'PAUSE':
          player?.pause();
          break;
          
        case 'STOP':
          if (player) {
            player.pause();
            player.currentTime = 0;
          }
          break;
          
        case 'RESTART':
          if (player) {
            player.currentTime = 0;
            player.play();
          }
          break;
          
        case 'SEEK':
          if (player) {
            player.currentTime = Math.max(0, Math.min(player.duration, player.currentTime + cmd.seconds));
          }
          break;
          
        case 'SEEK_TO':
          if (player) {
            player.currentTime = Math.max(0, Math.min(player.duration, cmd.seconds));
          }
          break;
          
        case 'SEEK_PERCENT':
          if (player && player.duration) {
            player.currentTime = (cmd.percent / 100) * player.duration;
          }
          break;
          
        case 'VOLUME_SET':
          if (player) {
            player.volume = cmd.value / 100;
          }
          break;
          
        case 'VOLUME_CHANGE':
          if (player) {
            const newVol = Math.max(0, Math.min(100, (player.volume * 100) + cmd.delta));
            player.volume = newVol / 100;
          }
          break;
          
        case 'MUTE':
          if (player) {
            player.muted = true;
          }
          break;
          
        case 'UNMUTE':
          if (player) {
            player.muted = false;
          }
          break;
          
        case 'SPEED_SET':
          if (player) {
            player.playbackRate = clampSpeed(cmd.speed);
          }
          break;
          
        case 'SPEED_CHANGE':
          if (player) {
            player.playbackRate = clampSpeed(player.playbackRate + cmd.delta);
          }
          break;
          
        case 'FULLSCREEN':
          clickButton('button.ytp-fullscreen-button');
          break;
          
        case 'EXIT_FULLSCREEN':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
          
        case 'THEATER_MODE':
          clickButton('button.ytp-size-button');
          break;
          
        case 'CAPTIONS_TOGGLE':
          clickButton('button.ytp-subtitles-button');
          break;
          
        case 'NEXT_VIDEO':
          clickButton('a.ytp-next-button');
          break;
          
        case 'PREV_VIDEO':
          clickButton('a.ytp-prev-button');
          break;
      }
    });
    
    logger.debug('Executed command', { type: cmd.type });
    return true;
  },
};