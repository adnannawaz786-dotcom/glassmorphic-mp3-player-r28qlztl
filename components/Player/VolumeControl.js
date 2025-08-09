'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

const VolumeControl = ({ 
  volume = 50, 
  onVolumeChange, 
  className = '',
  showLabel = false,
  orientation = 'horizontal' 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const sliderRef = useRef(null);
  const trackRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setShowTooltip(true);
    updateVolume(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      updateVolume(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setShowTooltip(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setShowTooltip(true);
    updateVolume(e.touches[0]);
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      updateVolume(e.touches[0]);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setShowTooltip(false);
  };

  const updateVolume = (event) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    let percentage;

    if (orientation === 'horizontal') {
      const x = event.clientX - rect.left;
      percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    } else {
      const y = event.clientY - rect.top;
      percentage = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
    }

    onVolumeChange?.(Math.round(percentage));
  };

  const handleMuteToggle = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      onVolumeChange?.(0);
    } else {
      onVolumeChange?.(previousVolume > 0 ? previousVolume : 50);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return VolumeX;
    if (volume < 50) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  const sliderVariants = {
    idle: { scale: 1 },
    active: { scale: 1.05 },
    hover: { scale: 1.02 }
  };

  const tooltipVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: orientation === 'horizontal' ? -10 : 0,
      x: orientation === 'vertical' ? -10 : 0
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: orientation === 'horizontal' ? -40 : 0,
      x: orientation === 'vertical' ? -50 : 0
    }
  };

  return (
    <div className={`volume-control flex items-center gap-3 ${className}`}>
      {/* Volume Icon Button */}
      <motion.button
        onClick={handleMuteToggle}
        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <VolumeIcon 
          size={20} 
          className={`transition-colors duration-200 ${
            volume === 0 
              ? 'text-red-400 group-hover:text-red-300' 
              : 'text-white/80 group-hover:text-white'
          }`}
        />
      </motion.button>

      {/* Volume Slider */}
      <div className="relative">
        <motion.div
          ref={sliderRef}
          className={`volume-slider relative ${
            orientation === 'horizontal' ? 'w-24 h-2' : 'w-2 h-24'
          }`}
          variants={sliderVariants}
          animate={isDragging ? 'active' : 'idle'}
          whileHover="hover"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => !isDragging && setShowTooltip(false)}
        >
          {/* Track */}
          <div
            ref={trackRef}
            className={`track absolute bg-white/20 rounded-full cursor-pointer ${
              orientation === 'horizontal' ? 'w-full h-2' : 'w-2 h-full'
            }`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* Progress Fill */}
            <motion.div
              className={`progress absolute bg-gradient-to-r from-blue-400 to-purple-400 rounded-full ${
                orientation === 'horizontal' 
                  ? 'h-full top-0 left-0' 
                  : 'w-full bottom-0 left-0'
              }`}
              style={{
                [orientation === 'horizontal' ? 'width' : 'height']: `${volume}%`
              }}
              initial={false}
              animate={{
                [orientation === 'horizontal' ? 'width' : 'height']: `${volume}%`
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />

            {/* Glow Effect */}
            <motion.div
              className={`glow absolute bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-full blur-sm ${
                orientation === 'horizontal' 
                  ? 'h-full top-0 left-0' 
                  : 'w-full bottom-0 left-0'
              }`}
              style={{
                [orientation === 'horizontal' ? 'width' : 'height']: `${volume}%`
              }}
              animate={{
                [orientation === 'horizontal' ? 'width' : 'height']: `${volume}%`,
                opacity: isDragging ? 0.8 : 0.4
              }}
            />
          </div>

          {/* Thumb */}
          <motion.div
            className="thumb absolute w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer border-2 border-white/30"
            style={{
              [orientation === 'horizontal' ? 'left' : 'bottom']: `calc(${volume}% - 8px)`,
              [orientation === 'horizontal' ? 'top' : 'left']: orientation === 'horizontal' ? '-4px' : '-4px'
            }}
            animate={{
              [orientation === 'horizontal' ? 'left' : 'bottom']: `calc(${volume}% - 8px)`,
              scale: isDragging ? 1.2 : 1,
              boxShadow: isDragging 
                ? '0 0 20px rgba(59, 130, 246, 0.5)' 
                : '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </motion.div>

        {/* Volume Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              className="tooltip absolute z-50 px-2 py-1 bg-black/80 text-white text-xs rounded backdrop-blur-sm border border-white/20"
              variants={tooltipVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{
                [orientation === 'horizontal' ? 'left' : 'bottom']: `calc(${volume}% - 12px)`,
                [orientation === 'horizontal' ? 'top' : 'left']: orientation === 'horizontal' ? '-40px' : '-50px'
              }}
            >
              {Math.round(volume)}%
              <div 
                className={`tooltip-arrow absolute w-2 h-2 bg-black/80 rotate-45 ${
                  orientation === 'horizontal' 
                    ? 'bottom-[-4px] left-1/2 transform -translate-x-1/2' 
                    : 'right-[-4px] top-1/2 transform -translate-y-1/2'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Volume Label */}
      {showLabel && (
        <motion.span 
          className="text-white/60 text-sm font-medium min-w-[2.5rem] text-right"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
        >
          {Math.round(volume)}%
        </motion.span>
      )}
    </div>
  );
};

export default VolumeControl;