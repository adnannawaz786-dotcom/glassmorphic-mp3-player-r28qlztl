'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Heart, MoreHorizontal, Search, Filter, Grid, List, Clock, Music } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

const TrackList = ({ 
  tracks = [], 
  onTrackSelect, 
  selectedTrack = null,
  viewMode = 'list',
  showSearch = true,
  showFilters = true,
  className = ''
}) => {
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    pauseTrack, 
    toggleFavorite, 
    favorites = [] 
  } = useAudioPlayer();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedTracks, setSelectedTracks] = useState([]);

  // Filter and search tracks
  const filteredTracks = useMemo(() => {
    let filtered = tracks;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(track => 
        track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'favorites':
          filtered = filtered.filter(track => favorites.includes(track.id));
          break;
        case 'recent':
          filtered = filtered.filter(track => track.lastPlayed);
          break;
        case 'unplayed':
          filtered = filtered.filter(track => !track.playCount);
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'artist':
          return (a.artist || '').localeCompare(b.artist || '');
        case 'album':
          return (a.album || '').localeCompare(b.album || '');
        case 'duration':
          return (a.duration || 0) - (b.duration || 0);
        case 'dateAdded':
          return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        case 'playCount':
          return (b.playCount || 0) - (a.playCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tracks, searchQuery, sortBy, filterBy, favorites]);

  const handleTrackPlay = (track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track);
      onTrackSelect?.(track);
    }
  };

  const handleTrackSelect = (track) => {
    onTrackSelect?.(track);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '--';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const isTrackFavorite = (trackId) => favorites.includes(trackId);
  const isCurrentTrack = (track) => currentTrack?.id === track.id;

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            {showSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Search tracks, artists, albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="title" className="bg-gray-800">Title</option>
                  <option value="artist" className="bg-gray-800">Artist</option>
                  <option value="album" className="bg-gray-800">Album</option>
                  <option value="duration" className="bg-gray-800">Duration</option>
                  <option value="dateAdded" className="bg-gray-800">Date Added</option>
                  <option value="playCount" className="bg-gray-800">Play Count</option>
                </select>

                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="all" className="bg-gray-800">All Tracks</option>
                  <option value="favorites" className="bg-gray-800">Favorites</option>
                  <option value="recent" className="bg-gray-800">Recently Played</option>
                  <option value="unplayed" className="bg-gray-800">Unplayed</option>
                </select>
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-white/60">
            {filteredTracks.length} track{filteredTracks.length !== 1 ? 's' : ''} 
            {searchQuery && ` found for "${searchQuery}"`}
          </div>
        </Card>
      )}

      {/* Track List */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
        {viewMode === 'list' ? (
          <div className="divide-y divide-white/10">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-white/60 border-b border-white/10">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Artist</div>
              <div className="col-span-2">Album</div>
              <div className="col-span-1">
                <Clock className="w-4 h-4" />
              </div>
              <div className="col-span-1">Size</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Track Rows */}
            <AnimatePresence>
              {filteredTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`grid grid-cols-12 gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer group ${
                    isCurrentTrack(track) ? 'bg-blue-500/20' : ''
                  } ${selectedTrack?.id === track.id ? 'bg-white/10' : ''}`}
                  onClick={() => handleTrackSelect(track)}
                >
                  {/* Track Number / Play Button */}
                  <div className="col-span-1 flex items-center">
                    <div className="relative">
                      <span className="group-hover:opacity-0 transition-opacity text-white/60">
                        {index + 1}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrackPlay(track);
                        }}
                      >
                        {isCurrentTrack(track) && isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center flex-shrink-0">
                      {track.artwork ? (
                        <img 
                          src={track.artwork} 
                          alt={track.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Music className="w-5 h-5 text-white/60" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className={`font-medium truncate ${
                        isCurrentTrack(track) ? 'text-blue-400' : 'text-white'
                      }`}>
                        {track.title || 'Unknown Title'}
                      </div>
                      {track.explicit && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          E
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Artist */}
                  <div className="col-span-2 flex items-center">
                    <span className="text-white/80 truncate">
                      {track.artist || 'Unknown Artist'}
                    </span>
                  </div>

                  {/* Album */}
                  <div className="col-span-2 flex items-center">
                    <span className="text-white/60 truncate">
                      {track.album || 'Unknown Album'}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="col-span-1 flex items-center">
                    <span className="text-white/60 text-sm">
                      {formatDuration(track.duration)}
                    </span>
                  </div>

                  {/* File Size */}
                  <div className="col-span-1 flex items-center">
                    <span className="text-white/60 text-sm">
                      {formatFileSize(track.size)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          isTrackFavorite(track.id) ? 'fill-red-500 text-red-500' : 'text-white/60'
                        }`} 
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            <AnimatePresence>
              {filteredTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`p-4 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group ${
                    isCurrentTrack(track) ? 'ring-2 ring-blue-500/50' : ''
                  } ${selectedTrack?.id === track.id ? 'bg-white/15' : ''}`}
                    onClick={() => handleTrackSelect(track)}
                  >
                    {/* Album Art */}
                    <div className="relative aspect-square mb-3">
                      {track.artwork ? (
                        <img 
                          src={track.artwork} 
                          alt={track.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center">
                          <Music className="w-8 h-8 text-white/60" />
                        </div>
                      )}
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          size="lg"
                          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTrackPlay(track);
                          }}