import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

const TrackItem = ({ 
  track, 
  index, 
  isPlaying = false, 
  onPlay, 
  onPause, 
  onAddToPlaylist,
  onToggleFavorite,
  showIndex = true,
  variant = 'default' 
}) => {
  const { currentTrack, isPlaying: audioIsPlaying } = useAudioPlayer();
  const isCurrentTrack = currentTrack?.id === track.id;
  const isTrackPlaying = isCurrentTrack && audioIsPlaying;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isTrackPlaying) {
      onPause?.(track);
    } else {
      onPlay?.(track);
    }
  };

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    onToggleFavorite?.(track);
  };

  const handleMoreOptions = (e) => {
    e.stopPropagation();
    onAddToPlaylist?.(track);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`
        group relative p-3 rounded-xl transition-all duration-300 cursor-pointer
        ${isCurrentTrack 
          ? 'bg-white/10 backdrop-blur-md border border-white/20' 
          : 'hover:bg-white/5 hover:backdrop-blur-sm'
        }
        ${variant === 'compact' ? 'p-2' : 'p-3'}
      `}
      onClick={handlePlayPause}
    >
      <div className="flex items-center gap-3">
        {/* Track Index/Play Button */}
        <div className="flex items-center justify-center w-10 h-10 relative">
          {showIndex && !isCurrentTrack && (
            <span className="text-sm text-gray-400 group-hover:opacity-0 transition-opacity duration-200">
              {index + 1}
            </span>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            className={`
              absolute inset-0 w-10 h-10 rounded-full transition-all duration-200
              ${isCurrentTrack ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
              bg-white/10 hover:bg-white/20 backdrop-blur-sm
            `}
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
          >
            {isTrackPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`
              font-medium truncate transition-colors duration-200
              ${isCurrentTrack ? 'text-blue-300' : 'text-white group-hover:text-blue-200'}
            `}>
              {track.title}
            </h4>
            {track.isExplicit && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                E
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="truncate">{track.artist}</span>
            {variant !== 'compact' && track.album && (
              <>
                <span>•</span>
                <span className="truncate">{track.album}</span>
              </>
            )}
          </div>
        </div>

        {/* Track Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Favorite Button */}
          <Button
            size="sm"
            variant="ghost"
            className={`
              w-8 h-8 rounded-full transition-all duration-200
              ${track.isFavorite 
                ? 'text-red-400 hover:text-red-300' 
                : 'text-gray-400 hover:text-white'
              }
            `}
            onClick={handleFavoriteToggle}
          >
            <Heart 
              className={`w-4 h-4 ${track.isFavorite ? 'fill-current' : ''}`} 
            />
          </Button>

          {/* Duration */}
          <span className="text-sm text-gray-400 min-w-[40px] text-right">
            {formatDuration(track.duration)}
          </span>

          {/* More Options */}
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 rounded-full text-gray-400 hover:text-white"
            onClick={handleMoreOptions}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Audio Visualizer for Current Track */}
      {isCurrentTrack && isTrackPlaying && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 pt-3 border-t border-white/10"
        >
          <div className="flex items-center gap-1 justify-center">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full"
                animate={{
                  height: [2, Math.random() * 16 + 4, 2],
                }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Glass morphism overlay */}
      {isCurrentTrack && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
      )}
    </motion.div>
  );
};

export default TrackItem;