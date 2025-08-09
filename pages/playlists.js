import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioContext } from '../contexts/AudioContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  Plus, 
  Play, 
  Pause, 
  Music, 
  Clock, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Download,
  Share2,
  Heart,
  HeartOff,
  Search,
  Filter,
  Grid3X3,
  List,
  Shuffle,
  Volume2,
  X
} from 'lucide-react';

const Playlists = () => {
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    pauseTrack, 
    playlists = [], 
    addPlaylist, 
    deletePlaylist, 
    updatePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    favoritePlaylist,
    unfavoritePlaylist
  } = useContext(AudioContext);

  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showPlaylistDetails, setShowPlaylistDetails] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);

  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    isPublic: false
  });

  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         playlist.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'favorites' && playlist.isFavorite) ||
                         (filterBy === 'created' && playlist.isOwned) ||
                         (filterBy === 'public' && playlist.isPublic);
    
    return matchesSearch && matchesFilter;
  });

  const handleCreatePlaylist = () => {
    if (newPlaylist.name.trim()) {
      const playlist = {
        id: Date.now().toString(),
        name: newPlaylist.name,
        description: newPlaylist.description,
        isPublic: newPlaylist.isPublic,
        isOwned: true,
        isFavorite: false,
        tracks: [],
        createdAt: new Date().toISOString(),
        duration: 0,
        coverImage: null
      };
      
      addPlaylist(playlist);
      setNewPlaylist({ name: '', description: '', isPublic: false });
      setShowCreateDialog(false);
    }
  };

  const handleEditPlaylist = (playlist) => {
    setEditingPlaylist(playlist);
    setNewPlaylist({
      name: playlist.name,
      description: playlist.description || '',
      isPublic: playlist.isPublic || false
    });
    setShowCreateDialog(true);
  };

  const handleUpdatePlaylist = () => {
    if (editingPlaylist && newPlaylist.name.trim()) {
      const updatedPlaylist = {
        ...editingPlaylist,
        name: newPlaylist.name,
        description: newPlaylist.description,
        isPublic: newPlaylist.isPublic
      };
      
      updatePlaylist(editingPlaylist.id, updatedPlaylist);
      setEditingPlaylist(null);
      setNewPlaylist({ name: '', description: '', isPublic: false });
      setShowCreateDialog(false);
    }
  };

  const handlePlayPlaylist = (playlist) => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0]);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Your Playlists</h1>
              <p className="text-gray-400">Organize and enjoy your music collections</p>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full"
                  onClick={() => setEditingPlaylist(null)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Playlist
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>
                    {editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {editingPlaylist ? 'Update your playlist details' : 'Give your playlist a name and description'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Playlist Name</Label>
                    <Input
                      id="name"
                      value={newPlaylist.name}
                      onChange={(e) => setNewPlaylist(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-gray-800/50 border-gray-600 text-white mt-1"
                      placeholder="Enter playlist name..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-white">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newPlaylist.description}
                      onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-800/50 border-gray-600 text-white mt-1 resize-none"
                      placeholder="Describe your playlist..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={newPlaylist.isPublic}
                      onChange={(e) => setNewPlaylist(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded border-gray-600 bg-gray-800/50"
                    />
                    <Label htmlFor="isPublic" className="text-white">Make playlist public</Label>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={editingPlaylist ? handleUpdatePlaylist : handleCreatePlaylist}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      disabled={!newPlaylist.name.trim()}
                    >
                      {editingPlaylist ? 'Update' : 'Create'} Playlist
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateDialog(false);
                        setEditingPlaylist(null);
                        setNewPlaylist({ name: '', description: '', isPublic: false });
                      }}
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                placeholder="Search playlists..."
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 text-white rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Playlists</option>
                <option value="created">Created by Me</option>
                <option value="favorites">Favorites</option>
                <option value="public">Public</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Playlists Grid/List */}
        <AnimatePresence>
          {filteredPlaylists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {searchQuery || filterBy !== 'all' ? 'No playlists found' : 'No playlists yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filterBy !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first playlist to get started'
                }
              </p>
              {!searchQuery && filterBy === 'all' && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Playlist
                </Button>
              )}
            </motion.div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {filteredPlaylists.map((playlist, index) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {viewMode === 'grid' ? (
                    <Card className="bg-gray-800/40 backdrop-blur-xl border-gray-700 hover:bg-gray-800/60 transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-6">
                        <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                          {playlist.coverImage ? (
                            <img 
                              src={playlist.coverImage} 
                              alt={playlist.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Music className="w-12 h-12 text-white/80" />
                          )}
                          
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayPlaylist(playlist);
                              }}
                              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 rounded-full w-12 h-12 p-0"
                            >
                              <Play className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-white truncate flex-1 mr-2">
                              {playlist.name}
                            </h3>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playlist.isFavorite 
                                    ? unfavoritePlaylist(playlist.id)
                                    : favoritePlaylist(playlist.id);
                                }}
                                className="w-8 h-8 p-0 hover:bg-white/10"
                              >
                                {playlist.isFavorite ? (
                                  <Heart className="w-4 h-4 text-red-500 fill-current" />