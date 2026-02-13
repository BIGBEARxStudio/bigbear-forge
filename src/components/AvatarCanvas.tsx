import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';

export interface AvatarCanvasProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AvatarCanvas - Mounts Three.js canvas for avatar rendering
 * Initializes avatar system on mount and handles cleanup on unmount
 */
export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  className = '',
  style = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initializeAvatarSystem = useGameStore((state) => state.initializeAvatarSystem);
  const disposeAvatarSystem = useGameStore((state) => state.disposeAvatarSystem);
  const isWebGLAvailable = useGameStore((state) => state.system.isWebGLAvailable);
  const useFallback = useGameStore((state) => state.system.useFallback);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize avatar system
    initializeAvatarSystem(canvas).catch((error) => {
      console.error('Failed to initialize avatar system:', error);
    });

    // Cleanup on unmount
    return () => {
      disposeAvatarSystem();
    };
  }, [initializeAvatarSystem, disposeAvatarSystem]);

  return (
    <div
      className={`avatar-canvas-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        ...style,
      }}
      data-testid="avatar-canvas-container"
    >
      <canvas
        ref={canvasRef}
        className="avatar-canvas"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
        data-testid="avatar-canvas"
      />

      {/* Fallback indicator */}
      {useFallback && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(255, 152, 0, 0.9)',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#fff',
            zIndex: 10,
          }}
          data-testid="fallback-indicator"
        >
          ⚠️ WebGL unavailable - using fallback mode
        </div>
      )}

      {/* WebGL status indicator (for debugging) */}
      {!isWebGLAvailable && !useFallback && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#666',
          }}
          data-testid="webgl-unavailable"
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '16px' }}>WebGL not available</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            Avatar rendering requires WebGL support
          </div>
        </div>
      )}
    </div>
  );
};
