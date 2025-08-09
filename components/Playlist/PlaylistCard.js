'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Music, MoreVertical, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

const PlaylistCard = ({ 
  playlist, 
  onPlay, 
  onEdit, 
  onDelete, 
  onAddToQueue,
  className = '',
  variant = 'default'
}) => {
  const { currentPlaylist, isPlaying } = useAudioPlayer();
  const isCurrentPlaylist = currentPlaylist?.id === playlist.id;

  const formatDuration = (duration) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTotalDuration = () => {
    if (!playlist.songs || playlist.songs.length === 0) return 0;
    return playlist.songs.reduce((total, song) => total + (song.duration || 0), 0);
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(playlist);
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
  };

  const cardVariants = {
    hover: {
      scale: 1.02,
      y: -4,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: 'easeInOut'
      }
    }
  };

  const playButtonVariants = {
    hover: {
      scale: 1.1,
      backgroundColor: 'rgba(99, 102, 241, 0.9)',
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
      className={`group cursor-pointer ${className}`}
    >
      <Card className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
        <CardContent className="p-0">
          {/* Cover Image */}
          <div className="relative aspect-square overflow-hidden">
            {playlist.coverImage ? (
              <img
                src={playlist.coverImage}
                alt={playlist.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
                <Music className="w-16 h-16 text-white/40" />
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Play Button */}
            <motion.div
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              variants={playButtonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                size="sm"
                className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg backdrop-blur-sm border border-white/10"
                onClick={handlePlayClick}
              >
                <Play className={`w-5 h-5 ${isCurrentPlaylist && isPlaying ? 'animate-pulse' : ''}`} fill="currentColor" />
              </Button>
            </motion.div>

            {/* Currently Playing Indicator */}
            {isCurrentPlaylist && isPlaying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-3 left-3"
              >
                <Badge className="bg-green-500/90 text-white text-xs font-medium">
                  Playing
                </Badge>
              </motion.div>
            )}

            {/* Menu Button */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm"
                    onClick={handleMenuClick}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900/95 backdrop-blur-xl border-white/10">
                  <DropdownMenuItem 
                    onClick={() => onPlay && onPlay(playlist)}
                    className="text-white hover:bg-white/10"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onAddToQueue && onAddToQueue(playlist)}
                    className="text-white hover:bg-white/10"
                  >
                    <Music className="w-4 h-4 mr-2" />
                    Add to Queue
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onEdit && onEdit(playlist)}
                    className="text-white hover:bg-white/10"
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete && onDelete(playlist)}
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-white text-lg line-clamp-1 group-hover:text-indigo-300 transition-colors duration-200">
                {playlist.name}
              </h3>
              
              {playlist.description && (
                <p className="text-gray-400 text-sm line-clamp-2">
                  {playlist.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                <span className="flex items-center gap-1">
                  <Music className="w-3 h-3" />
                  {playlist.songs?.length || 0} songs
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(getTotalDuration())}
                </span>
              </div>

              {/* Created Date */}
              {playlist.createdAt && (
                <div className="text-xs text-gray-500 mt-2">
                  Created {new Date(playlist.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlaylistCard;