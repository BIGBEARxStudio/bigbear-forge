import React from 'react';
import { Helmet } from 'react-helmet';
import { GameLayout } from '@/components/GameLayout';
import { GameController } from '@/components/GameController';
import { SceneRenderer } from '@/components/SceneRenderer';
import { MainMenuSceneComponent } from '@/components/MainMenuSceneComponent';
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

  return (
    <>
      <Helmet>
        <title>Play - BigBear Portfolio Game</title>
        <meta name="description" content="Play the BigBear card battle game" />
      </Helmet>

      <GameLayout showPerformanceMonitor={false}>
        <GameController initialScene="mainMenu" onSceneChange={handleSceneChange}>
          <SceneRenderer>
            {currentScene === 'mainMenu' && <MainMenuSceneComponent />}
            {currentScene === 'combat' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  color: '#fff',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    Combat Scene
                  </h1>
                  <p style={{ fontSize: '1.2rem', color: '#a0a0a0' }}>
                    Coming in Task 5
                  </p>
                </div>
              </div>
            )}
          </SceneRenderer>
        </GameController>
      </GameLayout>
    </>
  );
};

export default GamePage;
