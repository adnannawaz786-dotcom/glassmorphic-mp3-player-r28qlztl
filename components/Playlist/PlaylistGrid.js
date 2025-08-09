'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Music, MoreVertical, Plus, Edit3, Trash2, Heart, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const PlaylistGrid = ({ 
  playlists = [], 
  onPlaylistSelect, 
  onPlaylistPlay,
  onPlaylistEdit,
  onPlaylistDelete,
  onCreatePlaylist,
  currentPlayingId,
  isPlaying = false,
  viewMode = 'grid',
  searchQuery = '',
  sortBy = 'name'
}) => {
  const [hoveredId, setHoveredId] = useState(null);

  // Filter and sort playlists
  const filteredAndSortedPlaylists = useMemo(() => {
    let filtered = playlists.filter(playlist =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'dateCreated':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'trackCount':
          return b.tracks.length - a.tracks.length;
        case 'duration':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });
  }, [playlists, searchQuery, sortBy]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}h`;
    }
    return `${minutes}:${seconds % 60 < 10 ? '0' : ''}${Math.floor(seconds % 60)}`;
  };

  const PlaylistCard = ({ playlist, index }) => {
    const isCurrentlyPlaying = currentPlayingId === playlist.id && isPlaying;
    const totalDuration = playlist.tracks?.reduce((acc, track) => acc + (track.duration || 0), 0) || 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        onMouseEnter={() => setHoveredId(playlist.id)}
        onMouseLeave={() => setHoveredId(null)}
        className="group"
      >
        <Card className="relative overflow-hidden bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
          {/* Cover Art Section */}
          <div 
            className="relative aspect-square overflow-hidden"
            onClick={() => onPlaylistSelect?.(playlist)}
          >
            {playlist.coverArt ? (
              <img
                src={playlist.coverArt}
                alt={playlist.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <Music className="w-12 h-12 text-white/40" />
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Play Button Overlay */}
            <AnimatePresence>
              {(hoveredId === playlist.id || isCurrentlyPlaying) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Button
                    size="lg"
                    className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-black shadow-lg backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlaylistPlay?.(playlist);
                    }}
                  >
                    <Play className={`w-6 h-6 ${isCurrentlyPlaying ? 'animate-pulse' : ''}`} fill="currentColor" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Favorite Badge */}
            {playlist.isFavorite && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-red-500/80 text-white border-0">
                  <Heart className="w-3 h-3 mr-1" fill="currentColor" />
                  Favorite
                </Badge>
              </div>
            )}

            {/* More Options */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-md border-white/20">
                  <DropdownMenuItem onClick={() => onPlaylistPlay?.(playlist)}>
                    <Play className="w-4 h-4 mr-2" />
                    Play Playlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPlaylistEdit?.(playlist)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Playlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem 
                    onClick={() => onPlaylistDelete?.(playlist)}
                    className="text-red-400 focus:text-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Playlist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Playlist Info */}
          <div className="p-4">
            <h3 className="font-semibold text-white truncate mb-1">
              {playlist.name}
            </h3>
            
            {playlist.description && (
              <p className="text-sm text-white/60 line-clamp-2 mb-2">
                {playlist.description}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-white/50">
              <span className="flex items-center">
                <Music className="w-3 h-3 mr-1" />
                {playlist.tracks?.length || 0} tracks
              </span>
              
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatDuration(totalDuration)}
              </span>
            </div>

            {/* Created Date */}
            <div className="text-xs text-white/40 mt-2">
              Created {new Date(playlist.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Currently Playing Indicator */}
          {isCurrentlyPlaying && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500">
              <div className="h-full bg-white/30 animate-pulse" />
            </div>
          )}
        </Card>
      </motion.div>
    );
  };

  const CreatePlaylistCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card 
        className="relative overflow-hidden bg-white/5 backdrop-blur-md border-white/10 border-dashed hover:bg-white/10 transition-all duration-300 cursor-pointer h-full"
        onClick={() => onCreatePlaylist?.()}
      >
        <div className="aspect-square flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
              <Plus className="w-8 h-8 text-white/60" />
            </div>
            <h3 className="font-semibold text-white mb-1">Create Playlist</h3>
            <p className="text-sm text-white/60">Add your favorite tracks</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (filteredAndSortedPlaylists.length === 0 && searchQuery) {
    return (
      <div className="text-center py-12">
        <Music className="w-16 h-16 mx-auto mb-4 text-white/40" />
        <h3 className="text-xl font-semibold text-white mb-2">No playlists found</h3>
        <p className="text-white/60 mb-6">
          No playlists match your search for "{searchQuery}"
        </p>
        <Button onClick={() => onCreatePlaylist?.()} className="bg-white/10 hover:bg-white/20">
          <Plus className="w-4 h-4 mr-2" />
          Create New Playlist
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid Layout */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
          : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
      }`}>
        {/* Create Playlist Card */}
        <CreatePlaylistCard />
        
        {/* Playlist Cards */}
        {filteredAndSortedPlaylists.map((playlist, index) => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            index={index}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedPlaylists.length === 0 && !searchQuery && (
        <div className="text-center py-12">
          <Music className="w-16 h-16 mx-auto mb-4 text-white/40" />
          <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
          <p className="text-white/60 mb-6">
            Create your first playlist to organize your favorite tracks
          </p>
          <Button onClick={() => onCreatePlaylist?.()} className="bg-white/10 hover:bg-white/20">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Playlist
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlaylistGrid;