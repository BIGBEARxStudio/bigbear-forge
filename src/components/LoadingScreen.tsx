import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingScreenProps {
  progress?: number;
  message?: string;
  className?: string;
}

/**
 * LoadingScreen - Displays loading progress with animated progress bar
 * Shows asset loading progress and status messages
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress = 0,
  message = 'Loading...',
  className = '',
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div
      className={`loading-screen ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      data-testid="loading-screen"
    >
      {/* Animated Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{
          width: '80px',
          height: '80px',
          border: '8px solid rgba(255, 255, 255, 0.1)',
          borderTop: '8px solid #667eea',
          borderRadius: '50%',
          marginBottom: '2rem',
        }}
        data-testid="loading-spinner"
      />

      {/* Loading Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          fontSize: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'center',
        }}
        data-testid="loading-message"
      >
        {message}
      </motion.div>

      {/* Progress Bar Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          height: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}
        data-testid="progress-bar-container"
      >
        {/* Progress Bar Fill */}
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '4px',
            willChange: 'transform',
          }}
          data-testid="progress-bar-fill"
        />

        {/* Shimmer Effect */}
        {clampedProgress < 100 && (
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background:
                'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Progress Percentage */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          fontSize: '1rem',
          color: '#a0a0a0',
          marginTop: '1rem',
        }}
        data-testid="progress-percentage"
      >
        {Math.round(clampedProgress)}%
      </motion.div>
    </div>
  );
};
