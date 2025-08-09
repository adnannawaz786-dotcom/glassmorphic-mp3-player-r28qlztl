'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, Plus, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

const CreatePlaylist = ({ isOpen, onClose, onCreatePlaylist, availableSongs = [] }) => {
  const [playlistData, setPlaylistData] = useState({
    name: '',
    description: '',
    songs: []
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filteredSongs = availableSongs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {};
    
    if (!playlistData.name.trim()) {
      newErrors.name = 'Playlist name is required';
    }
    
    if (playlistData.name.length > 100) {
      newErrors.name = 'Playlist name must be less than 100 characters';
    }
    
    if (playlistData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setPlaylistData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const toggleSong = (song) => {
    setPlaylistData(prev => ({
      ...prev,
      songs: prev.songs.find(s => s.id === song.id)
        ? prev.songs.filter(s => s.id !== song.id)
        : [...prev.songs, song]
    }));
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    setIsCreating(true);
    
    try {
      const newPlaylist = {
        id: Date.now().toString(),
        name: playlistData.name.trim(),
        description: playlistData.description.trim(),
        songs: playlistData.songs,
        createdAt: new Date().toISOString(),
        duration: playlistData.songs.reduce((total, song) => total + (song.duration || 0), 0),
        coverImage: playlistData.songs[0]?.coverImage || null
      };
      
      await onCreatePlaylist(newPlaylist);
      
      // Reset form
      setPlaylistData({
        name: '',
        description: '',
        songs: []
      });
      setSearchTerm('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
      setErrors({ general: 'Failed to create playlist. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setPlaylistData({
        name: '',
        description: '',
        songs: []
      });
      setSearchTerm('');
      setErrors({});
      onClose();
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <Card className="bg-gray-900/95 backdrop-blur-xl border-gray-700/50 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Music className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Create New Playlist</h2>
                  <p className="text-sm text-gray-400">Add songs and customize your playlist</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isCreating}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)]">
              {/* Left Panel - Playlist Details */}
              <div className="lg:w-1/3 p-6 border-r border-gray-700/50">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Playlist Name *
                    </label>
                    <Input
                      value={playlistData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter playlist name"
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                      maxLength={100}
                      disabled={isCreating}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {playlistData.name.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <Textarea
                      value={playlistData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your playlist (optional)"
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 min-h-[100px]"
                      maxLength={500}
                      disabled={isCreating}
                    />
                    {errors.description && (
                      <p className="text-red-400 text-xs mt-1">{errors.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {playlistData.description.length}/500 characters
                    </p>
                  </div>

                  <Separator className="bg-gray-700/50" />

                  {/* Playlist Summary */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-300">Playlist Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Songs:</span>
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          {playlistData.songs.length}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">
                          {formatDuration(playlistData.songs.reduce((total, song) => total + (song.duration || 0), 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {errors.general && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">{errors.general}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleCreate}
                      disabled={isCreating || !playlistData.name.trim()}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
                    >
                      {isCreating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Create Playlist
                        </div>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      disabled={isCreating}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Panel - Song Selection */}
              <div className="lg:w-2/3 flex flex-col">
                <div className="p-6 border-b border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Add Songs</h3>
                    <Badge variant="outline" className="border-gray-600 text-gray-400">
                      {availableSongs.length} available
                    </Badge>
                  </div>
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search songs or artists..."
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                    disabled={isCreating}
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {filteredSongs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Music className="w-12 h-12 text-gray-600 mb-4" />
                      <h4 className="text-lg font-medium text-gray-400 mb-2">
                        {searchTerm ? 'No songs found' : 'No songs available'}
                      </h4>
                      <p className="text-gray-500">
                        {searchTerm 
                          ? 'Try adjusting your search terms'
                          : 'Add some songs to your library first'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredSongs.map((song) => {
                        const isSelected = playlistData.songs.find(s => s.id === song.id);
                        
                        return (
                          <motion.div
                            key={song.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card
                              className={`p-4 cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                  : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600'
                              }`}
                              onClick={() => !isCreating && toggleSong(song)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  {song.coverImage ? (
                                    <img
                                      src={song.coverImage}
                                      alt={song.title}
                                      className="w-12 h-12 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
                                      <Music className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                  
                                  <AnimatePresence>
                                    {isSelected && (
                                      <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center border-2 border-gray-900"
                                      >
                                        <Check className="w-3 h-3 text-white" />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-white truncate">{song.title}</h4>
                                  <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                                </div>
                                
                                <div className="text-sm text-gray-400">
                                  {formatDuration(song.duration || 0)}
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>