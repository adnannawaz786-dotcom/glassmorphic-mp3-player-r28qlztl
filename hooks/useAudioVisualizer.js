import { useRef, useEffect, useState, useCallback } from 'react';

export const useAudioVisualizer = (audioElement, isPlaying) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const dataArrayRef = useRef(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [visualizerType, setVisualizerType] = useState('bars'); // 'bars', 'wave', 'circular'
  const [sensitivity, setSensitivity] = useState(1);
  const [colors, setColors] = useState({
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#06b6d4'
  });

  // Initialize audio context and analyser
  const initializeAudioContext = useCallback(async () => {
    if (!audioElement || isInitialized) return;

    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Create analyser node
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      // Create source from audio element
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
      
      // Connect nodes
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      // Create data array
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  }, [audioElement, isInitialized]);

  // Resume audio context if suspended
  const resumeAudioContext = useCallback(async () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.error('Error resuming audio context:', error);
      }
    }
  }, []);

  // Draw bars visualizer
  const drawBars = useCallback((canvas, ctx, dataArray, bufferLength) => {
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const barWidth = (width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.5, colors.secondary);
    gradient.addColorStop(1, colors.accent);
    
    ctx.fillStyle = gradient;
    
    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * height * sensitivity;
      
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
  }, [colors, sensitivity]);

  // Draw wave visualizer
  const drawWave = useCallback((canvas, ctx, dataArray, bufferLength) => {
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors.primary;
    ctx.beginPath();
    
    const sliceWidth = width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const v = (dataArray[i] / 255) * sensitivity;
      const y = (v * height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Add glow effect
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [colors, sensitivity]);

  // Draw circular visualizer
  const drawCircular = useCallback((canvas, ctx, dataArray, bufferLength) => {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;
    
    ctx.clearRect(0, 0, width, height);
    
    // Create gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2);
    gradient.addColorStop(0, colors.accent);
    gradient.addColorStop(0.5, colors.secondary);
    gradient.addColorStop(1, colors.primary);
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    
    const angleStep = (Math.PI * 2) / bufferLength;
    
    for (let i = 0; i < bufferLength; i++) {
      const amplitude = (dataArray[i] / 255) * radius * sensitivity;
      const angle = angleStep * i;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + amplitude);
      const y2 = centerY + Math.sin(angle) * (radius + amplitude);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();
  }, [colors, sensitivity]);

  // Animation loop
  const animate = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    switch (visualizerType) {
      case 'bars':
        drawBars(canvas, ctx, dataArrayRef.current, bufferLength);
        break;
      case 'wave':
        drawWave(canvas, ctx, dataArrayRef.current, bufferLength);
        break;
      case 'circular':
        drawCircular(canvas, ctx, dataArrayRef.current, bufferLength);
        break;
      default:
        drawBars(canvas, ctx, dataArrayRef.current, bufferLength);
    }
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [visualizerType, isPlaying, drawBars, drawWave, drawCircular]);

  // Start visualization
  const startVisualization = useCallback(() => {
    if (isInitialized && isPlaying) {
      resumeAudioContext();
      animate();
    }
  }, [isInitialized, isPlaying, animate, resumeAudioContext]);

  // Stop visualization
  const stopVisualization = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  // Resize canvas
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  }, []);

  // Initialize on audio element change
  useEffect(() => {
    if (audioElement && !isInitialized) {
      initializeAudioContext();
    }
  }, [audioElement, initializeAudioContext, isInitialized]);

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      startVisualization();
    } else {
      stopVisualization();
    }
    
    return () => {
      stopVisualization();
    };
  }, [isPlaying, startVisualization, stopVisualization]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      resizeCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial resize
    setTimeout(resizeCanvas, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resizeCanvas]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVisualization();
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stopVisualization]);

  // Get frequency data for external use
  const getFrequencyData = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return null;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    return Array.from(dataArrayRef.current);
  }, []);

  // Get average frequency for reactive effects
  const getAverageFrequency = useCallback(() => {
    const data = getFrequencyData();
    if (!data) return 0;
    
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length / 255;
  }, [getFrequencyData]);

  return {
    canvasRef,
    isInitialized,
    visualizerType,
    setVisualizerType,
    sensitivity,
    setSensitivity,
    colors,
    setColors,
    startVisualization,
    stopVisualization,
    resizeCanvas,
    getFrequencyData,
    getAverageFrequency,
    initializeAudioContext,
    resumeAudioContext
  };
};

export default useAudioVisualizer;