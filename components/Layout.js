'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Music, 
  Library, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  Heart,
  Shuffle,
  Repeat
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const Layout = ({ children }) => {
  const router = useRouter();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');

  const navigationItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      path: '/',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'player', 
      label: 'Player', 
      icon: Music, 
      path: '/player',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'library', 
      label: 'Library', 
      icon: Library, 
      path: '/library',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  // Mock current track data
  useEffect(() => {
    setCurrentTrack({
      id: 1,
      title: 'Midnight Dreams',
      artist: 'Synthwave Artist',
      album: 'Neon Nights',
      duration: 245,
      coverArt: '/api/placeholder/60/60'
    });
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    // Handle next track logic
  };

  const handlePrevious = () => {
    // Handle previous track logic
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const handleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 pb-32 min-h-screen">
        <main className="px-4 py-6">
          {children}
        </main>
      </div>

      {/* Mini player */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 z-30"
          >
            <Card className="bg-black/20 backdrop-blur-xl border-white/10 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm truncate">
                    {currentTrack.title}
                  </h4>
                  <p className="text-gray-400 text-xs truncate">
                    {currentTrack.artist}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleLike}
                    className="p-2 hover:bg-white/10"
                  >
                    <Heart 
                      className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePlayPause}
                    className="p-2 hover:bg-white/10"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span>{formatTime(duration)}</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40"
      >
        <div className="mx-4 mb-4">
          <Card className="bg-black/20 backdrop-blur-xl border-white/10 p-2">
            <div className="flex items-center justify-around">
              {navigationItems.map((item) => {
                const isActive = router.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="lg"
                    onClick={() => router.push(item.path)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 hover:bg-white/10 transition-all duration-300 ${
                      isActive ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="relative">
                      <Icon 
                        className={`w-6 h-6 transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-gray-400'
                        }`} 
                      />
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className={`absolute -inset-2 rounded-lg bg-gradient-to-r ${item.gradient} opacity-20`}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </div>
                    <span 
                      className={`text-xs transition-all duration-300 ${
                        isActive ? 'text-white font-medium' : 'text-gray-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Button>
                );
              })}
            </div>
          </Card>
        </div>
      </motion.nav>
    </div>
  );
};

export default Layout;