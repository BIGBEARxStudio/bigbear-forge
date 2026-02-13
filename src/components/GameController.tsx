import React, { useEffect, useRef, useState } from 'react';
import { SceneManager } from '@/systems/SceneManager';
import { useGameStore } from '@/stores/gameStore';
import { AssetLoader } from '@/systems/AssetLoader';
import { LoadingScreen } from '@/components/LoadingScreen';

export interface GameControllerProps {
  children: React.ReactNode;
  initialScene?: string;
  onSceneChange?: (sceneName: string) => void;
}

/**
 * GameController - Orchestrates game scenes and systems
 * Manages scene lifecycle, game loop integration, and asset loading
 */
export const GameController: React.FC<GameControllerProps> = ({
  children,
  initialScene = 'mainMenu',
  onSceneChange,
}) => {
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const assetLoaderRef = useRef<AssetLoader | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  const startGameLoop = useGameStore((state) => state.startGameLoop);
  const stopGameLoop = useGameStore((state) => state.stopGameLoop);
  const setCurrentScene = useGameStore((state) => state.setCurrentScene);
  const setIsTransitioning = useGameStore((state) => state.setIsTransitioning);

  useEffect(() => {
    // Initialize systems
    const initialize = async () => {
      try {
        // Create asset loader
        const assetLoader = new AssetLoader();
        assetLoaderRef.current = assetLoader;

        // Load critical assets with progress tracking
        setLoadingMessage('Loading assets...');
        
        // Simulate asset loading progress (in real implementation, AssetLoader would provide this)
        const progressInterval = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        // Wait for assets to load (placeholder - AssetLoader doesn't have async load yet)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        clearInterval(progressInterval);
        setLoadingProgress(100);

        // Create scene manager
        setLoadingMessage('Initializing scene manager...');
        const sceneManager = new SceneManager();
        sceneManager.setTransitionConfig({
          type: 'fade',
          duration: 0.3,
          containerSelector: '#scene-container',
        });
        sceneManagerRef.current = sceneManager;

        // Start game loop
        setLoadingMessage('Starting game loop...');
        startGameLoop();

        // Small delay to show 100% completion
        await new Promise((resolve) => setTimeout(resolve, 300));

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize game:', error);
        setLoadingMessage('Failed to load game. Please refresh.');
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
      }
      stopGameLoop();
    };
  }, [startGameLoop, stopGameLoop]);

  useEffect(() => {
    if (!isInitialized || !sceneManagerRef.current) return;

    // Update scene in store
    setCurrentScene(initialScene);
    if (onSceneChange) {
      onSceneChange(initialScene);
    }
  }, [isInitialized, initialScene, setCurrentScene, onSceneChange]);

  // Expose scene transition method
  useEffect(() => {
    const handleTransition = async (sceneName: string) => {
      if (!sceneManagerRef.current) return;

      setIsTransitioning(true);
      try {
        await sceneManagerRef.current.transitionTo(sceneName);
        setCurrentScene(sceneName);
        if (onSceneChange) {
          onSceneChange(sceneName);
        }
      } finally {
        setIsTransitioning(false);
      }
    };

    // Store transition handler for use by other components
    (window as any).__sceneTransition = handleTransition;

    return () => {
      delete (window as any).__sceneTransition;
    };
  }, [setCurrentScene, setIsTransitioning, onSceneChange]);

  if (!isInitialized) {
    return (
      <LoadingScreen
        progress={loadingProgress}
        message={loadingMessage}
        data-testid="game-controller-loading"
      />
    );
  }

  return <>{children}</>;
};
