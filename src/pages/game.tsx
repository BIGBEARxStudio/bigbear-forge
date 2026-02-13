import React from 'react';
import { Helmet } from 'react-helmet';
import { GameLayout } from '@/components/GameLayout';
import { GameController } from '@/components/GameController';
import { SceneRenderer } from '@/components/SceneRenderer';

/**
 * Game Page - Main game container
 * Orchestrates game scenes and systems
 */
const GamePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Play - BigBear Portfolio Game</title>
        <meta name="description" content="Play the BigBear card battle game" />
      </Helmet>

      <GameLayout showPerformanceMonitor={false}>
        <GameController initialScene="mainMenu">
          <SceneRenderer>
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
                  Main Menu
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#a0a0a0' }}>
                  Scene integration coming in next tasks
                </p>
              </div>
            </div>
          </SceneRenderer>
        </GameController>
      </GameLayout>
    </>
  );
};

export default GamePage;
