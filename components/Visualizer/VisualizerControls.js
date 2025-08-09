'use client';

import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AudioContext } from '../../contexts/AudioContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Settings, 
  Palette, 
  BarChart3, 
  Waves, 
  Radio, 
  Activity,
  Sliders,
  Zap,
  Eye,
  EyeOff,
  RotateCcw,
  Download
} from 'lucide-react';

const VisualizerControls = ({ 
  visualizerType, 
  setVisualizerType,
  visualizerSettings,
  updateVisualizerSettings,
  isVisible,
  toggleVisibility
}) => {
  const { isPlaying } = useContext(AudioContext);
  const [activeTab, setActiveTab] = useState('type');

  const visualizerTypes = [
    { id: 'bars', name: 'Frequency Bars', icon: BarChart3, description: 'Classic frequency bars' },
    { id: 'waveform', name: 'Waveform', icon: Waves, description: 'Audio waveform display' },
    { id: 'circular', name: 'Circular', icon: Radio, description: 'Circular frequency display' },
    { id: 'spectrum', name: 'Spectrum', icon: Activity, description: 'Spectrum analyzer' }
  ];

  const colorPresets = [
    { name: 'Electric Blue', gradient: 'from-blue-400 via-cyan-400 to-blue-600', colors: ['#60A5FA', '#22D3EE', '#2563EB'] },
    { name: 'Neon Purple', gradient: 'from-purple-400 via-pink-400 to-purple-600', colors: ['#C084FC', '#F472B6', '#9333EA'] },
    { name: 'Fire Orange', gradient: 'from-orange-400 via-red-400 to-orange-600', colors: ['#FB923C', '#F87171', '#EA580C'] },
    { name: 'Matrix Green', gradient: 'from-green-400 via-emerald-400 to-green-600', colors: ['#4ADE80', '#34D399', '#16A34A'] },
    { name: 'Sunset', gradient: 'from-yellow-400 via-orange-400 to-red-500', colors: ['#FACC15', '#FB923C', '#EF4444'] },
    { name: 'Ocean', gradient: 'from-blue-400 via-teal-400 to-cyan-500', colors: ['#60A5FA', '#2DD4BF', '#06B6D4'] }
  ];

  const handleSettingChange = (key, value) => {
    updateVisualizerSettings({ [key]: value });
  };

  const resetSettings = () => {
    updateVisualizerSettings({
      sensitivity: 1.0,
      smoothing: 0.8,
      barCount: 64,
      barWidth: 4,
      barSpacing: 2,
      colorScheme: colorPresets[0],
      showPeaks: true,
      mirrorEffect: false,
      glowIntensity: 0.5,
      reactivity: 1.0
    });
  };

  const exportSettings = () => {
    const settings = {
      visualizerType,
      ...visualizerSettings
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visualizer-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="glass-card border-white/10">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Visualizer Controls</h3>
                <p className="text-sm text-white/60">Customize your audio visualization</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleVisibility}
                className="glass-button"
              >
                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isVisible ? 'Hide' : 'Show'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetSettings}
                className="glass-button"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportSettings}
                className="glass-button"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-6">
            <Badge variant={isPlaying ? 'default' : 'secondary'} className="glass-badge">
              <div className={`w-2 h-2 rounded-full mr-2 ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              {isPlaying ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="outline" className="glass-badge">
              {visualizerTypes.find(t => t.id === visualizerType)?.name || 'Unknown'}
            </Badge>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mb-6 p-1 bg-white/5 rounded-lg">
            {[
              { id: 'type', label: 'Type', icon: BarChart3 },
              { id: 'appearance', label: 'Appearance', icon: Palette },
              { id: 'behavior', label: 'Behavior', icon: Sliders },
              { id: 'effects', label: 'Effects', icon: Zap }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 ${activeTab === tab.id ? 'glass-button-active' : 'glass-button'}`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'type' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-white/80 mb-3">Visualizer Type</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {visualizerTypes.map(type => (
                    <motion.div
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`glass-card cursor-pointer transition-all duration-200 ${
                          visualizerType === type.id 
                            ? 'border-purple-400/50 bg-purple-500/10' 
                            : 'border-white/10 hover:border-white/20'
                        }`}
                        onClick={() => setVisualizerType(type.id)}
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                              visualizerType === type.id 
                                ? 'bg-purple-500/20 text-purple-400' 
                                : 'bg-white/10 text-white/60'
                            }`}>
                              <type.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="font-medium text-white">{type.name}</h5>
                              <p className="text-xs text-white/60">{type.description}</p>
                            </div>
                          </div>
                          {visualizerType === type.id && (
                            <Badge className="glass-badge">
                              <div className="w-2 h-2 rounded-full bg-purple-400 mr-2" />
                              Active
                            </Badge>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Color Schemes</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {colorPresets.map((preset, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Card
                          className={`glass-card cursor-pointer transition-all duration-200 ${
                            visualizerSettings.colorScheme?.name === preset.name
                              ? 'border-purple-400/50'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                          onClick={() => handleSettingChange('colorScheme', preset)}
                        >
                          <div className="p-3">
                            <div className={`h-8 rounded-lg bg-gradient-to-r ${preset.gradient} mb-2`} />
                            <p className="text-xs font-medium text-white">{preset.name}</p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white/80 mb-2 block">
                      Bar Count: {visualizerSettings.barCount}
                    </label>
                    <input
                      type="range"
                      min="16"
                      max="256"
                      step="16"
                      value={visualizerSettings.barCount}
                      onChange={(e) => handleSettingChange('barCount', parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/80 mb-2 block">
                      Bar Width: {visualizerSettings.barWidth}px
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={visualizerSettings.barWidth}
                      onChange={(e) => handleSettingChange('barWidth', parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'behavior' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white/80 mb-2 block">
                      Sensitivity: {(visualizerSettings.sensitivity * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3.0"
                      step="0.1"
                      value={visualizerSettings.sensitivity}
                      onChange={(e) => handleSettingChange('sensitivity', parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/80 mb-2 block">
                      Smoothing: {(visualizerSettings.smoothing * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.1"
                      value={visualizerSettings.smoothing}
                      onChange={(e) => handleSettingChange('smoothing', parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/80 mb-2 block">
                      Reactivity: {(visualizerSettings.reactivity * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.1"
                      value={visualizerSettings.reactivity}
                      onChange={(e) => handleSettingChange('reactivity', parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/80 mb-2 block">
                      Bar Spacing: {visualizerSettings.barSpacing}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={visualizerSettings