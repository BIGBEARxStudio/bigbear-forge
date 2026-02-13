import React from 'react';
import { motion } from 'framer-motion';

export interface VictoryDefeatSceneComponentProps {
  isVictory: boolean;
  onPlayAgain?: () => void;
  onReturnToMenu?: () => void;
}

/**
 * VictoryDefeatSceneComponent - React wrapper for VictoryDefeatScene
 * Displays victory or defeat message with action buttons
 */
export const VictoryDefeatSceneComponent: React.FC<VictoryDefeatSceneComponentProps> = ({
  isVictory,
  onPlayAgain,
  onReturnToMenu,
}) => {
  const handlePlayAgain = () => {
    if (onPlayAgain) {
      onPlayAgain();
    } else {
      // Default: transition to combat scene
      if ((window as any).__sceneTransition) {
        (window as any).__sceneTransition('combat');
      }
    }
  };

  const handleReturnToMenu = () => {
    if (onReturnToMenu) {
      onReturnToMenu();
    } else {
      // Default: transition to main menu
      if ((window as any).__sceneTransition) {
        (window as any).__sceneTransition('mainMenu');
      }
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
      data-testid="victory-defeat-scene"
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{
          fontSize: '8rem',
          marginBottom: '2rem',
        }}
      >
        {isVictory ? '🏆' : '💀'}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          fontSize: 'clamp(3rem, 10vw, 6rem)',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center',
          background: isVictory
            ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
            : 'linear-gradient(135deg, #f44336 0%, #9c27b0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        data-testid="result-title"
      >
        {isVictory ? 'Victory!' : 'Defeat!'}
      </motion.h1>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{
          fontSize: '1.5rem',
          color: '#a0a0a0',
          marginBottom: '3rem',
          textAlign: 'center',
        }}
        data-testid="result-message"
      >
        {isVictory
          ? 'You have defeated your opponent!'
          : 'Better luck next time!'}
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '100%',
          maxWidth: '300px',
        }}
      >
        {/* Play Again Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAgain}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#fff',
            background: isVictory
              ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
              : 'linear-gradient(135deg, #f44336 0%, #9c27b0 100%)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: isVictory
              ? '0 4px 15px rgba(255, 215, 0, 0.4)'
              : '0 4px 15px rgba(244, 67, 54, 0.4)',
            transition: 'box-shadow 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = isVictory
              ? '0 6px 20px rgba(255, 215, 0, 0.6)'
              : '0 6px 20px rgba(244, 67, 54, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = isVictory
              ? '0 4px 15px rgba(255, 215, 0, 0.4)'
              : '0 4px 15px rgba(244, 67, 54, 0.4)';
          }}
          data-testid="play-again-button"
        >
          Play Again
        </motion.button>

        {/* Return to Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReturnToMenu}
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
          data-testid="return-to-menu-button"
        >
          Return to Menu
        </motion.button>
      </motion.div>
    </div>
  );
};
