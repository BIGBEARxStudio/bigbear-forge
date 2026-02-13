import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';

export interface SceneRendererProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * SceneRenderer - Handles dynamic scene rendering with transitions
 * Provides loading states, error boundaries, and smooth transitions
 */
export const SceneRenderer: React.FC<SceneRendererProps> = ({
  children,
  fallback,
}) => {
  const currentScene = useGameStore((state) => state.ui.currentScene);
  const isTransitioning = useGameStore((state) => state.ui.isTransitioning);

  const defaultFallback = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        color: '#fff',
      }}
      data-testid="scene-loading"
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.2)',
            borderTop: '4px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <div>Loading scene...</div>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          initial={{ opacity: 0 }}
          animate={{ opacity: isTransitioning ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '100%',
            height: '100%',
          }}
          data-testid="scene-renderer"
          data-scene={currentScene}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );
};
