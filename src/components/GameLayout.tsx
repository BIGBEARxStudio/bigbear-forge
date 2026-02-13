import React from 'react';

export interface GameLayoutProps {
  children: React.ReactNode;
  showPerformanceMonitor?: boolean;
  className?: string;
}

/**
 * GameLayout - Full-screen container for game scenes
 * Provides scene container and UI overlay layer
 */
export const GameLayout: React.FC<GameLayoutProps> = ({
  children,
  showPerformanceMonitor = false,
  className = '',
}) => {
  return (
    <div
      className={`game-layout ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      data-testid="game-layout"
    >
      {/* Scene Container */}
      <div
        id="scene-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
        data-testid="scene-container"
      >
        {children}
      </div>

      {/* UI Overlay Layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
        data-testid="ui-overlay"
      >
        {/* Performance Monitor will be rendered here */}
        {showPerformanceMonitor && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              pointerEvents: 'auto',
            }}
          >
            {/* PerformanceMonitorComponent will be added here */}
          </div>
        )}
      </div>
    </div>
  );
};
