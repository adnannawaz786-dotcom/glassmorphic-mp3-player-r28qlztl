/**
 * Audio utility functions and Web Audio API helpers
 */

// Audio format validation
export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/m4a',
  'audio/flac'
];

export const SUPPORTED_FILE_EXTENSIONS = [
  '.mp3',
  '.wav',
  '.ogg',
  '.aac',
  '.m4a',
  '.flac'
];

/**
 * Check if a file is a supported audio format
 */
export const isValidAudioFile = (file) => {
  if (!file) return false;
  
  const hasValidType = SUPPORTED_AUDIO_FORMATS.includes(file.type);
  const hasValidExtension = SUPPORTED_FILE_EXTENSIONS.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  return hasValidType || hasValidExtension;
};

/**
 * Format time in seconds to MM:SS or HH:MM:SS format
 */
export const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Parse time string to seconds
 */
export const parseTimeToSeconds = (timeString) => {
  if (!timeString) return 0;
  
  const parts = timeString.split(':').map(Number);
  
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  
  return 0;
};

/**
 * Calculate percentage of current time vs duration
 */
export const calculateProgress = (currentTime, duration) => {
  if (!duration || duration === 0) return 0;
  return Math.min((currentTime / duration) * 100, 100);
};

/**
 * Generate a unique ID for audio tracks
 */
export const generateTrackId = () => {
  return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Extract metadata from audio file
 */
export const extractAudioMetadata = async (file) => {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      const metadata = {
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: audio.duration,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      };
      
      URL.revokeObjectURL(url);
      resolve(metadata);
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      resolve({
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: 0,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
    });
    
    audio.src = url;
  });
};

/**
 * Web Audio API Context Manager
 */
export class AudioContextManager {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.gainNode = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.gainNode = this.audioContext.createGain();
      
      // Configure analyser
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // Connect nodes
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  }

  connectAudioElement(audioElement) {
    if (!this.isInitialized) return;

    try {
      if (this.source) {
        this.source.disconnect();
      }
      
      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.gainNode);
    } catch (error) {
      console.error('Failed to connect audio element:', error);
    }
  }

  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(0);
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    return dataArray;
  }

  getTimeDomainData() {
    if (!this.analyser) return new Uint8Array(0);
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);
    
    return dataArray;
  }

  setVolume(volume) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      return this.audioContext.resume();
    }
  }

  suspend() {
    if (this.audioContext && this.audioContext.state === 'running') {
      return this.audioContext.suspend();
    }
  }

  close() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.analyser = null;
      this.source = null;
      this.gainNode = null;
      this.isInitialized = false;
    }
  }
}

/**
 * Audio visualizer utilities
 */
export const createVisualizerData = (frequencyData, barCount = 64) => {
  if (!frequencyData || frequencyData.length === 0) {
    return new Array(barCount).fill(0);
  }

  const dataPoints = [];
  const sliceWidth = frequencyData.length / barCount;

  for (let i = 0; i < barCount; i++) {
    const start = Math.floor(i * sliceWidth);
    const end = Math.floor((i + 1) * sliceWidth);
    
    let sum = 0;
    let count = 0;
    
    for (let j = start; j < end && j < frequencyData.length; j++) {
      sum += frequencyData[j];
      count++;
    }
    
    const average = count > 0 ? sum / count : 0;
    dataPoints.push(average / 255); // Normalize to 0-1
  }

  return dataPoints;
};

/**
 * Audio file loader utility
 */
export const loadAudioFiles = async (files) => {
  const audioFiles = Array.from(files).filter(isValidAudioFile);
  
  const loadedFiles = await Promise.all(
    audioFiles.map(async (file) => {
      const metadata = await extractAudioMetadata(file);
      const url = URL.createObjectURL(file);
      
      return {
        id: generateTrackId(),
        file,
        url,
        ...metadata
      };
    })
  );

  return loadedFiles;
};

/**
 * Playlist utilities
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getNextTrack = (currentIndex, playlist, isRepeat = false, isShuffle = false) => {
  if (!playlist || playlist.length === 0) return null;
  
  if (isRepeat) {
    return currentIndex;
  }
  
  if (isShuffle) {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } while (nextIndex === currentIndex && playlist.length > 1);
    return nextIndex;
  }
  
  return currentIndex + 1 < playlist.length ? currentIndex + 1 : 0;
};

export const getPreviousTrack = (currentIndex, playlist, isShuffle = false) => {
  if (!playlist || playlist.length === 0) return null;
  
  if (isShuffle) {
    let prevIndex;
    do {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } while (prevIndex === currentIndex && playlist.length > 1);
    return prevIndex;
  }
  
  return currentIndex - 1 >= 0 ? currentIndex - 1 : playlist.length - 1;
};

/**
 * Local storage utilities for audio settings
 */
export const STORAGE_KEYS = {
  VOLUME: 'audio_player_volume',
  PLAYLIST: 'audio_player_playlist',
  CURRENT_TRACK: 'audio_player_current_track',
  PLAYBACK_POSITION: 'audio_player_position',
  SETTINGS: 'audio_player_settings'
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};

/**
 * Audio equalizer utilities
 */
export class AudioEqualizer {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.filters = [];
    this.input = null;
    this.output = null;
    this.isConnected = false;
  }

  initialize(frequencies = [60, 170, 350, 1000, 3500, 10000]) {
    if (!this.audioContext) return;

    this.input = this.audioContext.createGain();
    this.output = this.audioContext.createGain();

    let previousFilter = this.input;

    frequencies.forEach((frequency, index) => {
      const filter = this.audioContext.createBiquadFilter();
      
      if (index === 0) {
        filter.type = 'lowshelf';
      } else if (index === frequencies.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1;
      }
      
      filter.frequency.value = frequency;
      filter.gain.value = 0;
      
      previousFilter.connect(filter);
      previousFilter = filter;
      
      this.filters.push({
        filter,
        frequency,
        gain: 0
      });
    });

    previousFilter.connect(this.output);
    this.isConnected = true;
  }

  setGain(index, gain) {
    if (this.filters[index]) {
      this.filters[index].filter.gain.value = Math.max(-12, Math.min(12, gain));
      this.filters[index].gain = gain;
    }
  }

  getGain(index) {
    return this.filters[index] ? this.filters[index].gain : 0;
  }

  reset() {
    this.filters.forEach(({ filter }) => {
      filter.gain.value = 0;
    });
  }

  connect(destination) {
    if (this.output) {
      this.output.connect(destination);
    }
  }

  disconnect() {
    if (this.output) {
      this.output.disconnect();
    }
  }
}

/**
 * Audio effects utilities
 */
export const createReverbEffect = (audioContext, roomSize = 0.5, decay = 2) => {
  const convolver = audioContext.createConvolver();
  const length = audioContext.sampleRate * decay;
  const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const n = length - i;
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, roomSize);
    }
  }
  
  convolver.buffer = impulse;
  return convolver;
};

export const createDelayEffect = (audioContext, delayTime = 0.3, feedback = 0.3) => {
  const delay = audioContext.createDelay();
  const feedbackGain = audioContext.createGain();
  const wetGain = audioContext.createGain();
  
  delay.delayTime.value = delayTime;
  feedbackGain.gain.value = feedback;
  wetGain.gain.value = 0.5;
  
  delay.connect(feedbackGain);
  feedbackGain.connect(delay);
  delay.connect(wetGain);
  
  return { delay, feedbackGain, wetGain };
};

/**
 * Error handling utilities
 */
export const AudioError = {
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  LOAD_FAILED: 'LOAD_FAILED',
  PLAYBACK_FAILED: 'PLAYBACK_FAILED',
  CONTEXT_FAILED: 'CONTEXT_FAILED'
};

export const handleAudioError = (error, trackInfo = null) => {
  console.error('Audio Error:', error);
  
  const errorInfo = {
    type: AudioError.PLAYBACK_FAILED,
    message: error.message || 'Unknown audio error',
    track: trackInfo,
    timestamp: new Date().toI