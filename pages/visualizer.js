import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

const VisualizerPage = () => {
  const router = useRouter();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    isShuffled,
    repeatMode,
    togglePlay,
    previousTrack,
    nextTrack,
    setVolume,
    seek,
    toggleShuffle,
    toggleRepeat,
    audioContext,
    audioSource
  } = useAudioPlayer();

  const [visualizerType, setVisualizerType] = useState('bars');
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);

  // Initialize audio analyzer
  useEffect(() => {
    if (audioContext && audioSource && !analyserRef.current) {
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      audioSource.connect(analyser);
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
  }, [audioContext, audioSource]);

  // Canvas animation
  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      if (!analyser || !dataArray) return;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (visualizerType === 'bars') {
        drawBars(ctx, dataArray, canvas.width, canvas.height);
      } else if (visualizerType === 'circle') {
        drawCircle(ctx, dataArray, canvas.width, canvas.height);
      } else if (visualizerType === 'wave') {
        drawWave(ctx, dataArray, canvas.width, canvas.height);
      } else if (visualizerType === 'particles') {
        drawParticles(ctx, dataArray, canvas.width, canvas.height);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      draw();
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, visualizerType]);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlsTimeout(timeout);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  const drawBars = (ctx, dataArray, width, height) => {
    const barWidth = width / dataArray.length * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      barHeight = (dataArray[i] / 255) * height * 0.8;

      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      gradient.addColorStop(0, `hsl(${i * 2}, 70%, 60%)`);
      gradient.addColorStop(1, `hsl(${i * 2}, 70%, 40%)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  const drawCircle = (ctx, dataArray, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.2;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    const angleStep = (Math.PI * 2) / dataArray.length;

    for (let i = 0; i < dataArray.length; i++) {
      const angle = i * angleStep;
      const amplitude = (dataArray[i] / 255) * 200;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + amplitude);
      const y2 = centerY + Math.sin(angle) * (radius + amplitude);

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `hsla(${i * 2}, 70%, 60%, 0.8)`);
      gradient.addColorStop(1, `hsla(${i * 2}, 70%, 40%, 0.2)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  const drawWave = (ctx, dataArray, width, height) => {
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();
  };

  const drawParticles = (ctx, dataArray, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < dataArray.length; i += 4) {
      const amplitude = dataArray[i] / 255;
      if (amplitude > 0.1) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = amplitude * 10;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, `hsla(${i * 3}, 70%, 60%, ${amplitude})`);
        gradient.addColorStop(1, `hsla(${i * 3}, 70%, 40%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(0.5);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleProgressChange = (value) => {
    const newTime = (value[0] / 100) * duration;
    seek(newTime);
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Canvas for visualizer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: showControls ? 1 : 0, x: showControls ? 0 : -20 }}
        className="absolute top-6 left-6 z-50"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="bg-black/20 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Visualizer type selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
        className="absolute top-6 right-6 z-50"
      >
        <Card className="bg-black/20 backdrop-blur-md border border-white/10 p-2">
          <div className="flex gap-2">
            {['bars', 'circle', 'wave', 'particles'].map((type) => (
              <Button
                key={type}
                variant={visualizerType === type ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizerType(type)}
                className={visualizerType === type 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              >
                {type}
              </Button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Track info */}
      <AnimatePresence>
        {currentTrack && showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40"
          >
            <Card className="bg-black/30 backdrop-blur-md border border-white/10 p-8 text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <div className="text-6xl">🎵</div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentTrack.title}
              </h2>
              <p className="text-white/70 text-lg">
                {currentTrack.artist}
              </p>
              {currentTrack.album && (
                <p className="text-white/50 text-sm mt-1">
                  {currentTrack.album}
                </p>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-0 left-0 right-0 z-50 p-6"
          >
            <Card className="bg-black/20 backdrop-blur-md border border-white/10 p-6">
              {/* Progress bar */}
              <div className="mb-4">
                <Slider
                  value={[duration ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleProgressChange}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-white/70 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* Left controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleShuffle}
                    className={`text-white/70 hover:text-white hover:bg-white/10 ${
                      isShuffled ? 'text-purple-400' : ''
                    }`}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleRepeat}
                    className={`text-white/70 hover:text-white hover:bg-white/10 ${
                      repeatMode !== 'off' ? 'text-purple-400' : ''
                    }`}
                  >
                    <Repeat className="h-4 w-4" />
                  </Button>
                </div>

                {/* Center controls */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={previousTrack