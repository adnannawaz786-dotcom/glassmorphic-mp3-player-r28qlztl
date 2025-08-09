'use client';

import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';

const AudioContext = createContext();

const initialState = {
  // Current track info
  currentTrack: null,
  currentTrackIndex: -1,
  
  // Playback state
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  duration: 0,
  currentTime: 0,
  volume: 1,
  isMuted: false,
  previousVolume: 1,
  
  // Playlist state
  playlist: [],
  queue: [],
  history: [],
  shuffle: false,
  repeat: 'none', // 'none', 'track', 'playlist'
  
  // Library state
  library: [],
  playlists: [],
  currentPlaylist: null,
  
  // UI state
  showVisualizer: true,
  showPlaylist: false,
  showLibrary: false,
  
  // Audio analysis
  audioData: null,
  frequencyData: new Uint8Array(256),
  
  // Error handling
  error: null,
  
  // Playback settings
  playbackRate: 1,
  crossfade: false,
  gapless: true,
};

const audioReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_TRACK':
      return {
        ...state,
        currentTrack: action.payload.track,
        currentTrackIndex: action.payload.index,
        error: null,
      };

    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: action.payload,
        isPaused: !action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload,
      };

    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.payload,
      };

    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.payload,
        isMuted: action.payload === 0,
        previousVolume: action.payload > 0 ? action.payload : state.previousVolume,
      };

    case 'TOGGLE_MUTE':
      return {
        ...state,
        isMuted: !state.isMuted,
        volume: !state.isMuted ? 0 : state.previousVolume,
      };

    case 'SET_PLAYLIST':
      return {
        ...state,
        playlist: action.payload,
      };

    case 'ADD_TO_PLAYLIST':
      return {
        ...state,
        playlist: [...state.playlist, action.payload],
      };

    case 'REMOVE_FROM_PLAYLIST':
      return {
        ...state,
        playlist: state.playlist.filter((_, index) => index !== action.payload),
      };

    case 'CLEAR_PLAYLIST':
      return {
        ...state,
        playlist: [],
        currentTrack: null,
        currentTrackIndex: -1,
        isPlaying: false,
      };

    case 'SET_QUEUE':
      return {
        ...state,
        queue: action.payload,
      };

    case 'ADD_TO_QUEUE':
      return {
        ...state,
        queue: [...state.queue, action.payload],
      };

    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        queue: state.queue.filter((_, index) => index !== action.payload),
      };

    case 'SET_SHUFFLE':
      return {
        ...state,
        shuffle: action.payload,
      };

    case 'SET_REPEAT':
      return {
        ...state,
        repeat: action.payload,
      };

    case 'SET_LIBRARY':
      return {
        ...state,
        library: action.payload,
      };

    case 'ADD_TO_LIBRARY':
      return {
        ...state,
        library: [...state.library, action.payload],
      };

    case 'REMOVE_FROM_LIBRARY':
      return {
        ...state,
        library: state.library.filter(track => track.id !== action.payload),
      };

    case 'SET_PLAYLISTS':
      return {
        ...state,
        playlists: action.payload,
      };

    case 'ADD_PLAYLIST':
      return {
        ...state,
        playlists: [...state.playlists, action.payload],
      };

    case 'UPDATE_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map(playlist =>
          playlist.id === action.payload.id ? action.payload : playlist
        ),
      };

    case 'DELETE_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.filter(playlist => playlist.id !== action.payload),
      };

    case 'SET_CURRENT_PLAYLIST':
      return {
        ...state,
        currentPlaylist: action.payload,
      };

    case 'TOGGLE_VISUALIZER':
      return {
        ...state,
        showVisualizer: !state.showVisualizer,
      };

    case 'TOGGLE_PLAYLIST':
      return {
        ...state,
        showPlaylist: !state.showPlaylist,
        showLibrary: false,
      };

    case 'TOGGLE_LIBRARY':
      return {
        ...state,
        showLibrary: !state.showLibrary,
        showPlaylist: false,
      };

    case 'SET_AUDIO_DATA':
      return {
        ...state,
        audioData: action.payload,
      };

    case 'SET_FREQUENCY_DATA':
      return {
        ...state,
        frequencyData: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_PLAYBACK_RATE':
      return {
        ...state,
        playbackRate: action.payload,
      };

    case 'TOGGLE_CROSSFADE':
      return {
        ...state,
        crossfade: !state.crossfade,
      };

    case 'TOGGLE_GAPLESS':
      return {
        ...state,
        gapless: !state.gapless,
      };

    case 'ADD_TO_HISTORY':
      return {
        ...state,
        history: [action.payload, ...state.history.slice(0, 49)], // Keep last 50 tracks
      };

    case 'NEXT_TRACK':
      const nextIndex = state.shuffle 
        ? Math.floor(Math.random() * state.playlist.length)
        : (state.currentTrackIndex + 1) % state.playlist.length;
      
      return {
        ...state,
        currentTrackIndex: nextIndex,
        currentTrack: state.playlist[nextIndex] || null,
        history: state.currentTrack 
          ? [state.currentTrack, ...state.history.slice(0, 49)]
          : state.history,
      };

    case 'PREVIOUS_TRACK':
      let prevIndex;
      if (state.currentTime > 3) {
        // If more than 3 seconds into track, restart current track
        return {
          ...state,
          currentTime: 0,
        };
      } else if (state.history.length > 0) {
        // Go to previous track from history
        const prevTrack = state.history[0];
        prevIndex = state.playlist.findIndex(track => track.id === prevTrack.id);
      } else {
        // Go to previous track in playlist
        prevIndex = state.currentTrackIndex > 0 
          ? state.currentTrackIndex - 1 
          : state.playlist.length - 1;
      }
      
      return {
        ...state,
        currentTrackIndex: prevIndex,
        currentTrack: state.playlist[prevIndex] || null,
        history: state.history.slice(1),
      };

    case 'SEEK_TO':
      return {
        ...state,
        currentTime: action.payload,
      };

    case 'RESET_PLAYER':
      return {
        ...initialState,
        library: state.library,
        playlists: state.playlists,
        volume: state.volume,
        showVisualizer: state.showVisualizer,
      };

    default:
      return state;
  }
};

export const AudioProvider = ({ children }) => {
  const [state, dispatch] = useReducer(audioReducer, initialState);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        gainNodeRef.current = audioContextRef.current.createGain();
        
        analyserRef.current.fftSize = 512;
        analyserRef.current.smoothingTimeConstant = 0.8;
        
        gainNodeRef.current.connect(audioContextRef.current.destination);
        analyserRef.current.connect(gainNodeRef.current);
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }
  }, []);

  // Connect audio element to Web Audio API
  useEffect(() => {
    if (audioRef.current && audioContextRef.current && !sourceRef.current) {
      try {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
      } catch (error) {
        console.warn('Failed to connect audio source:', error);
      }
    }
  }, [state.currentTrack]);

  // Update frequency data for visualizer
  useEffect(() => {
    if (!analyserRef.current) return;

    const updateFrequencyData = () => {
      if (state.isPlaying && analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        dispatch({ type: 'SET_FREQUENCY_DATA', payload: dataArray });
      }
      requestAnimationFrame(updateFrequencyData);
    };

    updateFrequencyData();
  }, [state.isPlaying]);

  // Audio event handlers
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      dispatch({ type: 'SET_DURATION', payload: audioRef.current.duration });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      dispatch({ type: 'SET_CURRENT_TIME', payload: audioRef.current.currentTime });
    }
  };

  const handleEnded = () => {
    if (state.repeat === 'track') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (state.repeat === 'playlist' || state.currentTrackIndex < state.playlist.length - 1) {
      dispatch({ type: 'NEXT_TRACK' });
    } else {
      dispatch({ type: 'SET_PLAYING', payload: false });
    }
  };

  const handleError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error.message || 'Playback error occurred' });
    dispatch({ type: 'SET_LOADING', payload: false });
    dispatch({ type: 'SET_PLAYING', payload: false });
  };

  const handleCanPlay = () => {
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const handleWaiting = () => {
    dispatch({ type: 'SET_LOADING', payload: true });
  };

  // Audio control functions
  const play = async () => {
    if (!audioRef.current || !state.currentTrack) return;

    try {
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      await audioRef.current.play();
      dispatch({ type: 'SET_PLAYING', payload: true });
    } catch (error) {
      handleError(error);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      dispatch({ type: 'SET_PLAYING', payload: false });
    }
  };

  const togglePlayPause = () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const nextTrack = () => {
    dispatch({ type: 'NEXT_TRACK' });
  };

  const previousTrack = () => {
    dispatch({ type: 'PREVIOUS_TRACK' });
  };

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      dispatch({ type: 'SEEK_TO', payload: time });
    }
  };

  const setVolume = (volume) => {
    if (audioRef.current && gainNodeRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      audioRef.current.volume = clampedVolume;
      gainNodeRef.current.gain.value = clampedVolume;
      dispatch({ type: 'SET_VOLUME', payload: clampedVolume });
    }
  };

  const toggleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
    if (audioRef.current && gainNodeRef.current) {
      const newVolume = state.isMuted ? state.previousVolume : 0;
      audioRef.current.volume = newVolume;
      gainNodeRef.current.gain.value = newVolume;
    }
  };

  const loadTrack = (track, index = -1) => {
    dispatch({ type: 'SET_CURRENT_TRACK', payload: { track, index } });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const addToPlaylist = (track) => {
    dispatch({ type: 'ADD_TO_PLAYLIST', payload: track });
  };

  const removeFromPlaylist = (index) => {
    dispatch({ type: 'REMOVE_FROM_PLAYLIST', payload: index });
  };

  const setPlaylist = (tracks) => {
    dispatch({ type: 'SET_PLAYLIST', payload: tracks });
  };

  const toggleShuffle = () => {
    dispatch({ type: 'SET_SHUFFLE', payload: !state.shuffle });
  };

  const toggleRepeat = () => {
    const modes = ['none', 'track', 'playlist'];
    const currentIndex = modes.indexOf(state.repeat);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    dispatch({ type: '