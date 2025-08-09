import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, Play, Pause, Heart, MoreVertical, Clock, Music, Album, User } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

const Library = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filterGenre, setFilterGenre] = useState('all');
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  // Mock library data
  const [tracks] = useState([
    {
      id: 1,
      title: 'Midnight Dreams',
      artist: 'Electronic Vibes',
      album: 'Synthwave Collection',
      genre: 'Electronic',
      duration: '4:23',
      year: 2023,
      artwork: '/api/placeholder/300/300',
      file: '/audio/track1.mp3'
    },
    {
      id: 2,
      title: 'Ocean Waves',
      artist: 'Ambient Sounds',
      album: 'Nature\'s Symphony',
      genre: 'Ambient',
      duration: '6:15',
      year: 2022,
      artwork: '/api/placeholder/300/300',
      file: '/audio/track2.mp3'
    },
    {
      id: 3,
      title: 'City Lights',
      artist: 'Urban Beats',
      album: 'Metropolitan',
      genre: 'Hip-Hop',
      duration: '3:45',
      year: 2023,
      artwork: '/api/placeholder/300/300',
      file: '/audio/track3.mp3'
    },
    {
      id: 4,
      title: 'Mountain Echo',
      artist: 'Folk Harmony',
      album: 'Wilderness',
      genre: 'Folk',
      duration: '5:12',
      year: 2021,
      artwork: '/api/placeholder/300/300',
      file: '/audio/track4.mp3'
    },
    {
      id: 5,
      title: 'Neon Nights',
      artist: 'Retro Wave',
      album: 'Cyberpunk Dreams',
      genre: 'Electronic',
      duration: '4:56',
      year: 2023,
      artwork: '/api/placeholder/300/300',
      file: '/audio/track5.mp3'
    },
    {
      id: 6,
      title: 'Jazz Café',
      artist: 'Smooth Trio',
      album: 'Late Night Sessions',
      genre: 'Jazz',
      duration: '7:33',
      year: 2022,
      artwork: '/api/placeholder/300/300',
      file: '/audio/track6.mp3'
    },
    {
      id: 7,
      title: 'Thunder Storm',
      artist: 'Rock Legends',
      album: 'Electric Storm',
      genre: 'Rock',
      duration: '4:18',
      year: 2023,
      artwork: '/api/placeholder/300/300',
      file: '/audio/track7.mp3'
    },
    {
      id: 8,
      title: 'Peaceful Morning',
      artist: 'Classical Ensemble',
      album: 'Sunrise Sonatas',
      genre: 'Classical',
      duration: '8:24',
      year: 2021,
      artwork: '/api/placeholder/300/300',
      file: '/audio/track8.mp3'
    }
  ]);

  const genres = ['all', ...new Set(tracks.map(track => track.genre))];

  const filteredTracks = tracks
    .filter(track => {
      const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           track.album.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = filterGenre === 'all' || track.genre === filterGenre;
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'album':
          return a.album.localeCompare(b.album);
        case 'year':
          return b.year - a.year;
        case 'duration':
          return a.duration.localeCompare(b.duration);
        default:
          return 0;
      }
    });

  const handlePlay = (track) => {
    if (currentPlaying === track.id) {
      setCurrentPlaying(null);
    } else {
      setCurrentPlaying(track.id);
    }
  };

  const toggleFavorite = (trackId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(trackId)) {
      newFavorites.delete(trackId);
    } else {
      newFavorites.add(trackId);
    }
    setFavorites(newFavorites);
  };

  const TrackCard = ({ track }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardContent className="p-4">
          <div className="relative mb-4">
            <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 overflow-hidden">
              <img
                src={track.artwork}
                alt={track.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMUYyOTM3Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzEyMi4zODYgMTAwIDEwMCAxMjIuMzg2IDEwMCAxNTBDMTAwIDE3Ny42MTQgMTIyLjM4NiAyMDAgMTUwIDIwMEMxNzcuNjE0IDIwMCAyMDAgMTc3LjYxNCAyMDAgMTUwQzIwMCAxMjIuMzg2IDE3Ny42MTQgMTAwIDE1MCAxMDBaTTE1MCAxODBDMTMzLjQzMSAxODAgMTIwIDE2Ni41NjkgMTIwIDE1MEMxMjAgMTMzLjQzMSAxMzMuNDMxIDEyMCAxNTAgMTIwQzE2Ni41NjkgMTIwIDE4MCAxMzMuNDMxIDE4MCAxNTBDMTgwIDE2Ni41NjkgMTY2LjU2OSAxODAgMTUwIDE4MFoiIGZpbGw9IiM0Qjc2ODgiLz4KPC9zdmc+';
                }}
              />
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => handlePlay(track)}
              >
                {currentPlaying === track.id ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className={`absolute top-2 right-2 text-white hover:bg-white/20 ${
                favorites.has(track.id) ? 'text-red-400' : ''
              }`}
              onClick={() => toggleFavorite(track.id)}
            >
              <Heart className={`w-4 h-4 ${favorites.has(track.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-white truncate">{track.title}</h3>
            <p className="text-gray-400 text-sm truncate">{track.artist}</p>
            <p className="text-gray-500 text-xs truncate">{track.album}</p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-white/10 text-white">
                {track.genre}
              </Badge>
              <span className="text-gray-400 text-xs">{track.duration}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const TrackRow = ({ track, index }) => (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex-shrink-0">
              <img
                src={track.artwork}
                alt={track.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMUYyOTM3Ii8+CjxwYXRoIGQ9Ik0yNCAxNkMxOS41ODE3IDE2IDE2IDE5LjU4MTcgMTYgMjRDMTYgMjguNDE4MyAxOS41ODE3IDMyIDI0IDMyQzI4LjQxODMgMzIgMzIgMjguNDE4MyAzMiAyNEMzMiAxOS41ODE3IDI4LjQxODMgMTYgMjQgMTZaTTI0IDI4LjhDMjEuMzQ5IDI4LjggMTkuMiAyNi42NTEgMTkuMiAyNEMxOS4yIDIxLjM0OSAyMS4zNDkgMTkuMiAyNCAxOS4yQzI2LjY1MSAxOS4yIDI4LjggMjEuMzQ5IDI4LjggMjRDMjguOCAyNi42NTEgMjYuNjUxIDI4LjggMjQgMjguOFoiIGZpbGw9IiM0Qjc2ODgiLz4KPC9zdmc+';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 p-1"
                  onClick={() => handlePlay(track)}
                >
                  {currentPlaying === track.id ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white truncate">{track.title}</h3>
                  <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`text-white hover:bg-white/20 ${
                      favorites.has(track.id) ? 'text-red-400' : ''
                    }`}
                    onClick={() => toggleFavorite(track.id)}
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(track.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">