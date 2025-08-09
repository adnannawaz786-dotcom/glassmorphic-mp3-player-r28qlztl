import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { AudioContext } from '../contexts/AudioContext';

export const useAudioPlayer = () => {
  const audioContext = useContext(AudioContext);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'one', 'all'
  const [visualizerData, setVisualizerData] = useState(new Uint8Array(128));

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
      audioRef.current.preload = 'metadata';
    }

    const audio = audioRef.current;

    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(audio.duration);
      setError(null);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      handleTrackEnd();
    };
    const handleError = (e) => {
      setIsLoading(false);
      setError('Failed to load audio file');
      setIsPlaying(false);
    };
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Initialize Web Audio API for visualizer
  const initializeAudioContext = useCallback(async () => {
    if (!audioRef.current || analyserRef.current) return;

    try {
      const audioContextInstance = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContextInstance.createAnalyser();
      const source = audioContextInstance.createMediaElementSource(audioRef.current);
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      source.connect(analyser);
      analyser.connect(audioContextInstance.destination);
      
      analyserRef.current = analyser;
      sourceRef.current = source;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }, []);

  // Visualizer data update loop
  const updateVisualizerData = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    setVisualizerData(new Uint8Array(dataArrayRef.current));

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateVisualizerData);
    }
  }, [isPlaying]);

  // Start visualizer when playing
  useEffect(() => {
    if (isPlaying && analyserRef.current) {
      updateVisualizerData();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, updateVisualizerData]);

  // Play function
  const play = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      await initializeAudioContext();
      await audioRef.current.play();
      setIsPlaying(true);
      setError(null);
    } catch (error) {
      console.error('Failed to play audio:', error);
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  }, [initializeAudioContext]);

  // Pause function
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Load track
  const loadTrack = useCallback((src) => {
    if (!audioRef.current || !src) return;

    setIsLoading(true);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    
    audioRef.current.src = src;
    audioRef.current.load();
  }, []);

  // Seek to position
  const seekTo = useCallback((time) => {
    if (audioRef.current && !isNaN(time)) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [duration]);

  // Set volume
  const changeVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clampedVolume;
    }
  }, [isMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (audioRef.current) {
        audioRef.current.volume = newMuted ? 0 : volume;
      }
      return newMuted;
    });
  }, [volume]);

  // Change playback rate
  const changePlaybackRate = useCallback((rate) => {
    const clampedRate = Math.max(0.25, Math.min(4, rate));
    setPlaybackRate(clampedRate);
    
    if (audioRef.current) {
      audioRef.current.playbackRate = clampedRate;
    }
  }, []);

  // Skip forward/backward
  const skipForward = useCallback((seconds = 10) => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.currentTime + seconds, duration);
      seekTo(newTime);
    }
  }, [duration, seekTo]);

  const skipBackward = useCallback((seconds = 10) => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - seconds, 0);
      seekTo(newTime);
    }
  }, [seekTo]);

  // Handle track end based on repeat mode
  const handleTrackEnd = useCallback(() => {
    if (!audioContext) return;

    const { currentTrack, playlist, setCurrentTrack } = audioContext;
    
    if (repeatMode === 'one') {
      seekTo(0);
      play();
      return;
    }

    if (repeatMode === 'all' || repeatMode === 'none') {
      const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);
      
      if (isShuffled) {
        const availableTracks = playlist.filter(track => track.id !== currentTrack?.id);
        if (availableTracks.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableTracks.length);
          setCurrentTrack(availableTracks[randomIndex]);
        }
      } else {
        const nextIndex = currentIndex + 1;
        
        if (nextIndex < playlist.length) {
          setCurrentTrack(playlist[nextIndex]);
        } else if (repeatMode === 'all') {
          setCurrentTrack(playlist[0]);
        }
      }
    }
  }, [repeatMode, isShuffled, audioContext, seekTo, play]);

  // Next track
  const nextTrack = useCallback(() => {
    if (!audioContext) return;

    const { currentTrack, playlist, setCurrentTrack } = audioContext;
    const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);

    if (isShuffled) {
      const availableTracks = playlist.filter(track => track.id !== currentTrack?.id);
      if (availableTracks.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableTracks.length);
        setCurrentTrack(availableTracks[randomIndex]);
      }
    } else {
      const nextIndex = (currentIndex + 1) % playlist.length;
      setCurrentTrack(playlist[nextIndex]);
    }
  }, [audioContext, isShuffled]);

  // Previous track
  const previousTrack = useCallback(() => {
    if (!audioContext) return;

    const { currentTrack, playlist, setCurrentTrack } = audioContext;
    const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);

    if (isShuffled) {
      const availableTracks = playlist.filter(track => track.id !== currentTrack?.id);
      if (availableTracks.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableTracks.length);
        setCurrentTrack(availableTracks[randomIndex]);
      }
    } else {
      const prevIndex = currentIndex - 1 < 0 ? playlist.length - 1 : currentIndex - 1;
      setCurrentTrack(playlist[prevIndex]);
    }
  }, [audioContext, isShuffled]);

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => !prev);
  }, []);

  // Toggle repeat mode
  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      switch (prev) {
        case 'none':
          return 'all';
        case 'all':
          return 'one';
        case 'one':
          return 'none';
        default:
          return 'none';
      }
    });
  }, []);

  // Format time helper
  const formatTime = useCallback((time) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Get progress percentage
  const getProgress = useCallback(() => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    error,
    playbackRate,
    isShuffled,
    repeatMode,
    visualizerData,
    
    // Controls
    play,
    pause,
    togglePlayPause,
    loadTrack,
    seekTo,
    changeVolume,
    toggleMute,
    changePlaybackRate,
    skipForward,
    skipBackward,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
    
    // Helpers
    formatTime,
    getProgress,
    
    // Refs (for advanced usage)
    audioRef,
    analyserRef
  };
};