import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';

export interface MainMenuSceneComponentProps {
  onStartBattle?: () => void;
  onSettings?: () => void;
}

/**
 * MainMenuSceneComponent - React wrapper for MainMenuScene
 * Displays title, start battle button, settings button, and avatar preview
 */
export const MainMenuSceneComponent: React.FC<MainMenuSceneComponentProps> = ({
  onStartBattle,
  onSettings,
}) => {
  const handleStartBattle = () => {
    if (onStartBattle) {
      onStartBattle();
    } else {
      // Default: transition to combat scene
      if ((window as any).__sceneTransition) {
        (window as any).__sceneTransition('combat');
      }
    }
  };

  const handleSettings = () => {
    if (onSettings) {
      onSettings();
    } else {
      // Default: show settings (placeholder)
      console.log('Settings clicked');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      data-testid="main-menu-scene"
    >
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          fontWeight: 'bold',
          marginBottom: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Card Battle
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          fontSize: '1.2rem',
          color: '#a0a0a0',
          marginBottom: '3rem',
          textAlign: 'center',
        }}
      >
        A Premium Portfolio Game
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '100%',
          maxWidth: '300px',
        }}
      >
        {/* Start Battle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartBattle}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#fff',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'box-shadow 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
          data-testid="start-battle-button"
        >
          Start Battle
        </motion.button>

        {/* Settings Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSettings}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#fff',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
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
          data-testid="settings-button"
        >
          Settings
        </motion.button>
      </motion.div>

      {/* Avatar Preview Placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        style={{
          marginTop: '3rem',
          padding: '1rem',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.9rem',
          color: '#888',
        }}
        data-testid="avatar-preview-placeholder"
      >
        Avatar customization coming soon
      </motion.div>
    </div>
  );
};
