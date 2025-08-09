import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';

const PlayerControls = ({
  isPlaying = false,
  onPlayPause,
  onPrevious,
  onNext,
  onShuffle,
  onRepeat,
  isShuffled = false,
  repeatMode = 'off', // 'off', 'all', 'one'
  volume = 50,
  onVolumeChange,
  disabled = false
}) => {
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const playButtonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.9 }
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'one') {
      return (
        <div className="relative">
          <Repeat size={20} />
          <span className="absolute -top-1 -right-1 text-xs font-bold">1</span>
        </div>
      );
    }
    return <Repeat size={20} />;
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-6">
        {/* Shuffle Button */}
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShuffle}
            disabled={disabled}
            className={`
              h-10 w-10 rounded-full p-0 transition-all duration-200
              backdrop-blur-md border border-white/10
              ${isShuffled 
                ? 'bg-purple-500/30 text-purple-300 hover:bg-purple-500/40' 
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }
              disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            <Shuffle size={16} />
          </Button>
        </motion.div>

        {/* Previous Button */}
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={disabled}
            className="
              h-12 w-12 rounded-full p-0 transition-all duration-200
              bg-white/10 backdrop-blur-md border border-white/20
              text-white hover:bg-white/20 hover:scale-105
              disabled:opacity-30 disabled:cursor-not-allowed
            "
          >
            <SkipBack size={20} />
          </Button>
        </motion.div>

        {/* Play/Pause Button */}
        <motion.div 
          variants={playButtonVariants} 
          whileHover="hover" 
          whileTap="tap"
          className="relative"
        >
          <Button
            variant="ghost"
            size="lg"
            onClick={onPlayPause}
            disabled={disabled}
            className="
              h-16 w-16 rounded-full p-0 transition-all duration-300
              bg-gradient-to-br from-purple-500/80 to-pink-500/80
              backdrop-blur-md border-2 border-white/30
              text-white hover:from-purple-400/90 hover:to-pink-400/90
              shadow-lg shadow-purple-500/25
              disabled:opacity-30 disabled:cursor-not-allowed
              relative overflow-hidden
            "
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20"
              animate={{
                scale: isPlaying ? [1, 1.2, 1] : 1,
                opacity: isPlaying ? [0.5, 0.8, 0.5] : 0.5
              }}
              transition={{
                duration: 2,
                repeat: isPlaying ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
            
            {/* Play/Pause Icon */}
            <motion.div
              initial={false}
              animate={{ 
                rotate: isPlaying ? 0 : 0,
                scale: isPlaying ? 1 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </motion.div>
          </Button>
        </motion.div>

        {/* Next Button */}
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={disabled}
            className="
              h-12 w-12 rounded-full p-0 transition-all duration-200
              bg-white/10 backdrop-blur-md border border-white/20
              text-white hover:bg-white/20 hover:scale-105
              disabled:opacity-30 disabled:cursor-not-allowed
            "
          >
            <SkipForward size={20} />
          </Button>
        </motion.div>

        {/* Repeat Button */}
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRepeat}
            disabled={disabled}
            className={`
              h-10 w-10 rounded-full p-0 transition-all duration-200
              backdrop-blur-md border border-white/10
              ${repeatMode !== 'off' 
                ? 'bg-purple-500/30 text-purple-300 hover:bg-purple-500/40' 
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }
              disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            {getRepeatIcon()}
          </Button>
        </motion.div>
      </div>

      {/* Volume Control */}
      <motion.div 
        className="flex items-center space-x-3 px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Volume2 size={18} className="text-white/70 flex-shrink-0" />
        
        <div className="flex-1 relative group">
          <Slider
            value={[volume]}
            onValueChange={(value) => onVolumeChange?.(value[0])}
            max={100}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          
          {/* Volume percentage tooltip */}
          <motion.div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                     bg-black/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-white
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     pointer-events-none"
            style={{ left: `${volume}%` }}
          >
            {Math.round(volume)}%
          </motion.div>
        </div>
        
        <span className="text-xs text-white/50 w-8 text-right">
          {Math.round(volume)}%
        </span>
      </motion.div>

      {/* Control Indicators */}
      <div className="flex justify-center space-x-4 text-xs text-white/40">
        {isShuffled && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-1"
          >
            <Shuffle size={12} />
            <span>Shuffle</span>
          </motion.span>
        )}
        
        {repeatMode !== 'off' && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-1"
          >
            <Repeat size={12} />
            <span>
              {repeatMode === 'one' ? 'Repeat One' : 'Repeat All'}
            </span>
          </motion.span>
        )}
      </div>
    </div>
  );
};

export default PlayerControls;