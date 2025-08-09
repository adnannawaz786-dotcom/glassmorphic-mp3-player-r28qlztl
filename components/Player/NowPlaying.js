'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MoreHorizontal, Volume2, VolumeX, Shuffle, Repeat, SkipBack, Play, Pause, SkipForward } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';

const NowPlaying = ({ 
  currentTrack,
  isPlaying,
  volume,
  isMuted,
  isShuffled,
  repeatMode,
  currentTime,
  duration,
  onPlayPause,
  onPrevious,
  onNext,
  onShuffle,
  onRepeat,
  onVolumeChange,
  onMute,
  onSeek,
  onLike,
  className 
}) => {
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) {
    return (
      <Card className={cn(
        "glass-card border-white/10 bg-black/20 backdrop-blur-xl p-6",
        "flex items-center justify-center min-h-[400px]",
        className
      )}>
        <div className="text-center text-white/60">
          <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-4 flex items-center justify-center">
            <Volume2 className="w-8 h-8" />
          </div>
          <p className="text-lg font-medium">No track selected</p>
          <p className="text-sm">Choose a song to start playing</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "glass-card border-white/10 bg-black/20 backdrop-blur-xl p-6 text-white",
      className
    )}>
      {/* Track Info */}
      <div className="flex items-start gap-4 mb-6">
        <motion.div 
          className="relative flex-shrink-0"
          animate={{ 
            rotate: isPlaying ? 360 : 0,
            scale: isPlaying ? 1.05 : 1 
          }}
          transition={{ 
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.3 }
          }}
        >
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500/50 to-pink-500/50 flex items-center justify-center overflow-hidden">
            {currentTrack.artwork ? (
              <img 
                src={currentTrack.artwork} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Volume2 className="w-8 h-8 text-white/60" />
            )}
          </div>
          {isPlaying && (
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-sm" />
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white mb-1 truncate">
            {currentTrack.title}
          </h3>
          <p className="text-white/70 mb-2 truncate">
            {currentTrack.artist}
          </p>
          {currentTrack.album && (
            <p className="text-white/50 text-sm truncate mb-2">
              {currentTrack.album}
            </p>
          )}
          <div className="flex items-center gap-2">
            {currentTrack.genre && (
              <Badge variant="secondary" className="bg-white/10 text-white/80 border-white/20">
                {currentTrack.genre}
              </Badge>
            )}
            <span className="text-white/50 text-sm">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike?.(currentTrack.id)}
            className={cn(
              "text-white/60 hover:text-white hover:bg-white/10",
              currentTrack.liked && "text-red-400 hover:text-red-300"
            )}
          >
            <Heart className={cn("w-5 h-5", currentTrack.liked && "fill-current")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Separator className="bg-white/10 mb-6" />

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-white/60 mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div 
          className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percentage = (e.clientX - rect.left) / rect.width;
            onSeek?.(percentage * duration);
          }}
        >
          <motion.div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.1 }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%) translateY(-50%)' }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Secondary Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShuffle}
            className={cn(
              "text-white/60 hover:text-white hover:bg-white/10",
              isShuffled && "text-purple-400 hover:text-purple-300"
            )}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRepeat}
            className={cn(
              "text-white/60 hover:text-white hover:bg-white/10",
              repeatMode !== 'off' && "text-purple-400 hover:text-purple-300"
            )}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full" />
            )}
          </Button>
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={onPrevious}
            className="text-white hover:text-white hover:bg-white/10"
          >
            <SkipBack className="w-6 h-6" />
          </Button>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onPlayPause}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </Button>
          </motion.div>

          <Button
            variant="ghost"
            size="lg"
            onClick={onNext}
            className="text-white hover:text-white hover:bg-white/10"
          >
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMute}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <div className="w-20 h-2 bg-white/10 rounded-full relative">
            <div 
              className="absolute left-0 top-0 h-full bg-white/60 rounded-full"
              style={{ width: `${isMuted ? 0 : volume}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange?.(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Audio Visualizer Placeholder */}
      <div className="mt-6 h-16 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden">
        <div className="flex items-end gap-1 h-8">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-gradient-to-t from-purple-500/50 to-pink-500/50 rounded-full"
              animate={{
                height: isPlaying ? [
                  Math.random() * 20 + 5,
                  Math.random() * 30 + 10,
                  Math.random() * 20 + 5
                ] : 2
              }}
              transition={{
                duration: 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.05
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default NowPlaying;