import React from 'react';
import { Helmet } from 'react-helmet';

/**
 * Game Page - Main game container
 * Will be integrated with GameController and SceneRenderer in next tasks
 */
const GamePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Play - BigBear Portfolio Game</title>
        <meta name="description" content="Play the BigBear card battle game" />
      </Helmet>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Game Loading...
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#a0a0a0' }}>
            Game integration coming in next tasks
          </p>
        </div>
      </div>
    </>
  );
};

export default GamePage;
