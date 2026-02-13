import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '@/hooks/useSettings';

export interface SettingsPanelProps {
  onClose?: () => void;
  className?: string;
}

/**
 * SettingsPanel - Settings UI component
 * Provides controls for volume, performance monitor, and reduced motion
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onClose,
  className = '',
}) => {
  const { settings, updateSetting, resetSettings } = useSettings();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSetting('volume', parseInt(e.target.value, 10));
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSetting('musicVolume', parseInt(e.target.value, 10));
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSetting('sfxVolume', parseInt(e.target.value, 10));
  };

  const handlePerformanceMonitorToggle = () => {
    updateSetting('showPerformanceMonitor', !settings.showPerformanceMonitor);
  };

  const handleReducedMotionToggle = () => {
    updateSetting('reducedMotion', !settings.reducedMotion);
  };

  const handleReset = () => {
    resetSettings();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`settings-panel ${className}`}
      style={{
        backgroundColor: '#1a1a2e',
        color: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      data-testid="settings-panel"
      role="dialog"
      aria-labelledby="settings-title"
    >
      {/* Title */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h2
          id="settings-title"
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          Settings
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            aria-label="Close settings"
            data-testid="close-button"
          >
            ✕
          </button>
        )}
      </div>

      {/* Volume Controls */}
      <div style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            fontSize: '1.2rem',
            marginBottom: '1rem',
            color: '#667eea',
          }}
        >
          Audio
        </h3>

        {/* Master Volume */}
        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="volume-slider"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <span>Master Volume</span>
            <span data-testid="volume-value">{settings.volume}%</span>
          </label>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="100"
            value={settings.volume}
            onChange={handleVolumeChange}
            style={{ width: '100%' }}
            aria-label="Master volume"
            data-testid="volume-slider"
          />
        </div>

        {/* Music Volume */}
        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="music-volume-slider"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <span>Music Volume</span>
            <span data-testid="music-volume-value">{settings.musicVolume}%</span>
          </label>
          <input
            id="music-volume-slider"
            type="range"
            min="0"
            max="100"
            value={settings.musicVolume}
            onChange={handleMusicVolumeChange}
            style={{ width: '100%' }}
            aria-label="Music volume"
            data-testid="music-volume-slider"
          />
        </div>

        {/* SFX Volume */}
        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="sfx-volume-slider"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <span>Sound Effects Volume</span>
            <span data-testid="sfx-volume-value">{settings.sfxVolume}%</span>
          </label>
          <input
            id="sfx-volume-slider"
            type="range"
            min="0"
            max="100"
            value={settings.sfxVolume}
            onChange={handleSfxVolumeChange}
            style={{ width: '100%' }}
            aria-label="Sound effects volume"
            data-testid="sfx-volume-slider"
          />
        </div>
      </div>

      {/* Display Options */}
      <div style={{ marginBottom: '2rem' }}>
        <h3
          style={{
            fontSize: '1.2rem',
            marginBottom: '1rem',
            color: '#667eea',
          }}
        >
          Display
        </h3>

        {/* Performance Monitor */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <label htmlFor="performance-monitor-toggle">
            Show Performance Monitor
          </label>
          <input
            id="performance-monitor-toggle"
            type="checkbox"
            checked={settings.showPerformanceMonitor}
            onChange={handlePerformanceMonitorToggle}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            aria-label="Show performance monitor"
            data-testid="performance-monitor-toggle"
          />
        </div>

        {/* Reduced Motion */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <label htmlFor="reduced-motion-toggle">Reduced Motion</label>
          <input
            id="reduced-motion-toggle"
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={handleReducedMotionToggle}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            aria-label="Enable reduced motion"
            data-testid="reduced-motion-toggle"
          />
        </div>
      </div>

      {/* Reset Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleReset}
        style={{
          width: '100%',
          padding: '1rem',
          fontSize: '1rem',
          fontWeight: 'bold',
          color: '#fff',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
        aria-label="Reset settings to defaults"
        data-testid="reset-button"
      >
        Reset to Defaults
      </motion.button>
    </motion.div>
  );
};
