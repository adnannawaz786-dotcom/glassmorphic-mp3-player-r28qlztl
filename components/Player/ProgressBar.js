'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ 
  currentTime = 0, 
  duration = 0, 
  onSeek, 
  isLoading = false,
  className = '' 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const progressRef = useRef(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayProgress = isDragging ? (dragTime / duration) * 100 : progress;

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (e) => {
    if (!progressRef.current || !duration) return;
    
    setIsDragging(true);
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    setDragTime(Math.max(0, Math.min(duration, newTime)));
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    setDragTime(Math.max(0, Math.min(duration, newTime)));
  };

  const handleMouseUp = () => {
    if (isDragging && onSeek) {
      onSeek(dragTime);
    }
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (!progressRef.current || !duration) return;
    
    setIsDragging(true);
    const touch = e.touches[0];
    const rect = progressRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const newTime = (touchX / rect.width) * duration;
    setDragTime(Math.max(0, Math.min(duration, newTime)));
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !progressRef.current || !duration) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const rect = progressRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const newTime = (touchX / rect.width) * duration;
    setDragTime(Math.max(0, Math.min(duration, newTime)));
  };

  const handleTouchEnd = () => {
    if (isDragging && onSeek) {
      onSeek(dragTime);
    }
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalTouchMove = (e) => handleTouchMove(e);
    const handleGlobalTouchEnd = () => handleTouchEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, dragTime]);

  return (
    <div className={`w-full ${className}`}>
      {/* Time Display */}
      <div className="flex items-center justify-between text-sm text-white/70 mb-2">
        <span className="font-mono">
          {formatTime(isDragging ? dragTime : currentTime)}
        </span>
        <span className="font-mono">
          {formatTime(duration)}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div
        ref={progressRef}
        className="relative h-2 bg-white/10 rounded-full cursor-pointer group backdrop-blur-sm"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Background Track */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-full" />

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-pulse" />
        )}

        {/* Progress Fill */}
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full shadow-lg"
          style={{
            width: `${Math.max(0, Math.min(100, displayProgress))}%`,
          }}
          animate={{
            width: `${Math.max(0, Math.min(100, displayProgress))}%`,
          }}
          transition={{
            duration: isDragging ? 0 : 0.1,
            ease: 'easeOut',
          }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-sm opacity-50" />
        </motion.div>

        {/* Progress Handle */}
        <motion.div
          className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{
            left: `${Math.max(0, Math.min(100, displayProgress))}%`,
          }}
          animate={{
            left: `${Math.max(0, Math.min(100, displayProgress))}%`,
            scale: isDragging ? 1.2 : 1,
          }}
          transition={{
            duration: isDragging ? 0 : 0.1,
            ease: 'easeOut',
          }}
        >
          {/* Handle Glow */}
          <div className="absolute inset-0 bg-white rounded-full blur-sm opacity-50" />
          
          {/* Handle Core */}
          <div className="relative w-full h-full bg-gradient-to-br from-white to-gray-200 rounded-full border border-white/20" />
        </motion.div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-blue-400/10 group-hover:via-purple-400/10 group-hover:to-pink-400/10 rounded-full transition-all duration-300" />
      </div>

      {/* Buffer/Loaded Indicator (for future enhancement) */}
      <div className="absolute inset-0 bg-white/5 rounded-full opacity-0">
        <div className="h-full bg-white/10 rounded-full" style={{ width: '0%' }} />
      </div>
    </div>
  );
};

export default ProgressBar;