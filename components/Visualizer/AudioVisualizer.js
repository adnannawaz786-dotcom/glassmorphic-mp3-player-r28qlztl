'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const AudioVisualizer = ({ 
  audioElement, 
  isPlaying, 
  className = '',
  type = 'bars',
  color = '#8b5cf6',
  sensitivity = 1,
  smoothing = 0.8
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Web Audio API
  const initializeAudio = useCallback(async () => {
    if (!audioElement || isInitialized) return;

    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create analyser
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = smoothing;
      
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
  }, [audioElement, isInitialized, smoothing]);

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
    
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(0.5, color + '80');
    gradient.addColorStop(1, color);
    
    ctx.fillStyle = gradient;
    
    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * height * sensitivity;
      
      const cornerRadius = 2;
      const barX = x;
      const barY = height - barHeight;
      const barW = barWidth - 2;
      const barH = barHeight;
      
      // Draw rounded rectangle
      ctx.beginPath();
      ctx.moveTo(barX + cornerRadius, barY);
      ctx.lineTo(barX + barW - cornerRadius, barY);
      ctx.quadraticCurveTo(barX + barW, barY, barX + barW, barY + cornerRadius);
      ctx.lineTo(barX + barW, barY + barH);
      ctx.lineTo(barX, barY + barH);
      ctx.lineTo(barX, barY + cornerRadius);
      ctx.quadraticCurveTo(barX, barY, barX + cornerRadius, barY);
      ctx.closePath();
      ctx.fill();
      
      x += barWidth + 1;
    }
  }, [color, sensitivity]);

  // Draw circular visualizer
  const drawCircular = useCallback((canvas, ctx, dataArray, bufferLength) => {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;
    
    ctx.clearRect(0, 0, width, height);
    
    const sliceWidth = (Math.PI * 2) / bufferLength;
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    
    for (let i = 0; i < bufferLength; i++) {
      const angle = sliceWidth * i;
      const amplitude = (dataArray[i] / 255) * radius * sensitivity;
      
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
    ctx.fillStyle = color;
    ctx.fill();
  }, [color, sensitivity]);

  // Draw waveform visualizer
  const drawWaveform = useCallback((canvas, ctx, dataArray, bufferLength) => {
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
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
    
    ctx.stroke();
    
    // Draw mirrored waveform
    ctx.beginPath();
    x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = (dataArray[i] / 255) * sensitivity;
      const y = height - (v * height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.stroke();
  }, [color, sensitivity]);

  // Animation loop
  const animate = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    
    switch (type) {
      case 'bars':
        drawBars(canvas, ctx, dataArrayRef.current, bufferLength);
        break;
      case 'circular':
        drawCircular(canvas, ctx, dataArrayRef.current, bufferLength);
        break;
      case 'waveform':
        drawWaveform(canvas, ctx, dataArrayRef.current, bufferLength);
        break;
      default:
        drawBars(canvas, ctx, dataArrayRef.current, bufferLength);
    }
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [type, isPlaying, drawBars, drawCircular, drawWaveform]);

  // Handle canvas resize
  const handleResize = useCallback(() => {
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

  // Initialize audio when component mounts
  useEffect(() => {
    if (audioElement && !isInitialized) {
      initializeAudio();
    }
  }, [audioElement, initializeAudio, isInitialized]);

  // Handle play/pause
  useEffect(() => {
    if (isPlaying && isInitialized) {
      resumeAudioContext();
      animate();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isInitialized, animate, resumeAudioContext]);

  // Handle resize
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <motion.div
      className={`relative w-full h-full ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg bg-black/20 backdrop-blur-sm border border-white/10"
        style={{ 
          filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))',
        }}
      />
      
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/60 text-sm">
            Loading visualizer...
          </div>
        </div>
      )}
      
      {isInitialized && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="w-16 h-16 rounded-full border-2 border-white/20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default AudioVisualizer;