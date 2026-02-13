import React, { useEffect, useRef, useState } from 'react';
import { SceneManager } from '@/systems/SceneManager';
import { useGameStore } from '@/stores/gameStore';
import { AssetLoader } from '@/systems/AssetLoader';

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

  const startGameLoop = useGameStore((state) => state.startGameLoop);
  const stopGameLoop = useGameStore((state) => state.stopGameLoop);
  const setCurrentScene = useGameStore((state) => state.setCurrentScene);
  const setIsTransitioning = useGameStore((state) => state.setIsTransitioning);

  useEffect(() => {
    // Initialize systems
    const initialize = async () => {
      // Create scene manager
      const sceneManager = new SceneManager();
      sceneManager.setTransitionConfig({
        type: 'fade',
        duration: 0.3,
        containerSelector: '#scene-container',
      });
      sceneManagerRef.current = sceneManager;

      // Create asset loader
      const assetLoader = new AssetLoader();
      assetLoaderRef.current = assetLoader;

      // Start game loop
      startGameLoop();

      setIsInitialized(true);
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          color: '#fff',
        }}
        data-testid="game-controller-loading"
      >
        Initializing...
      </div>
    );
  }

  return <>{children}</>;
};
