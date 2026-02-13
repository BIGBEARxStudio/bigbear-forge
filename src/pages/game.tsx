import React from 'react';
import { Helmet } from 'react-helmet';
import { GameLayout } from '@/components/GameLayout';
import { GameController } from '@/components/GameController';
import { SceneRenderer } from '@/components/SceneRenderer';
import { MainMenuSceneComponent } from '@/components/MainMenuSceneComponent';
import { CombatSceneComponent } from '@/components/CombatSceneComponent';
import { VictoryDefeatSceneComponent } from '@/components/VictoryDefeatSceneComponent';
import { GameErrorBoundary } from '@/components/GameErrorBoundary';
import { useGameStore } from '@/stores/gameStore';

/**
 * Game Page - Main game container
 * Orchestrates game scenes and systems
 */
const GamePage: React.FC = () => {
  const currentScene = useGameStore((state) => state.ui.currentScene);

  const handleSceneChange = (sceneName: string) => {
    console.log(`Scene changed to: ${sceneName}`);
  };

  const resetGameState = useGameStore((state) => state.resetGameState);
  const setCurrentScene = useGameStore((state) => state.setCurrentScene);

  const handleVictory = () => {
    console.log('Victory!');
    if ((window as any).__sceneTransition) {
      (window as any).__sceneTransition('victory');
    }
  };

  const handleDefeat = () => {
    console.log('Defeat!');
    if ((window as any).__sceneTransition) {
      (window as any).__sceneTransition('defeat');
    }
  };

  const handlePlayAgain = () => {
    resetGameState();
    if ((window as any).__sceneTransition) {
      (window as any).__sceneTransition('combat');
    }
  };

  const handleReturnToMenu = () => {
    resetGameState();
    if ((window as any).__sceneTransition) {
      (window as any).__sceneTransition('mainMenu');
    }
  };

  const handleErrorRetry = () => {
    // Reset to main menu on error retry
    resetGameState();
    setCurrentScene('mainMenu');
  };

  const handleErrorReturnToMenu = () => {
    // Navigate to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <>
      <Helmet>
        <title>Play Game - BigBear Portfolio Game</title>
        <meta name="description" content="Play the BigBear card battle game. Experience strategic combat with 3D avatars and smooth 60 FPS gameplay." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://bigbear-forge.com/game" />
      </Helmet>

      <GameLayout showPerformanceMonitor={false}>
        <GameErrorBoundary
          onRetry={handleErrorRetry}
          onReturnToMenu={handleErrorReturnToMenu}
        >
          <GameController initialScene="mainMenu" onSceneChange={handleSceneChange}>
            <SceneRenderer>
              {currentScene === 'mainMenu' && <MainMenuSceneComponent />}
              {currentScene === 'combat' && (
                <CombatSceneComponent
                  onVictory={handleVictory}
                  onDefeat={handleDefeat}
                />
              )}
              {(currentScene === 'victory' || currentScene === 'defeat') && (
                <VictoryDefeatSceneComponent
                  isVictory={currentScene === 'victory'}
                  onPlayAgain={handlePlayAgain}
                  onReturnToMenu={handleReturnToMenu}
                />
              )}
            </SceneRenderer>
          </GameController>
        </GameErrorBoundary>
      </GameLayout>
    </>
  );
};

export default GamePage;
