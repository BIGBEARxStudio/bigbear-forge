import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';

export interface CameraControlsProps {
  className?: string;
  style?: React.CSSProperties;
  sensitivity?: number;
  zoomSensitivity?: number;
}

/**
 * CameraControls - Interactive camera control component
 * Provides mouse drag for orbit, scroll for zoom, and reset button
 */
export const CameraControls: React.FC<CameraControlsProps> = ({
  className = '',
  style = {},
  sensitivity = 1.0,
  zoomSensitivity = 1.0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const orbitCamera = useGameStore((state) => state.orbitCamera);
  const zoomCamera = useGameStore((state) => state.zoomCamera);
  const resetCamera = useGameStore((state) => state.resetCamera);
  const camera = useGameStore((state) => state.camera);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = (e.clientX - dragStart.x) * sensitivity;
    const deltaY = (e.clientY - dragStart.y) * sensitivity;

    orbitCamera(deltaX, deltaY);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * 0.01 * zoomSensitivity;
    zoomCamera(delta);
  };

  const handleReset = () => {
    resetCamera();
  };

  return (
    <div
      ref={containerRef}
      className={`camera-controls ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        ...style,
      }}
      data-testid="camera-controls"
    >
      {/* Control Instructions Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#fff',
          pointerEvents: 'none',
        }}
        data-testid="control-instructions"
      >
        <div style={{ marginBottom: '4px' }}>🖱️ Drag to orbit</div>
        <div style={{ marginBottom: '4px' }}>🔍 Scroll to zoom</div>
        <div>↺ Click reset to center</div>
      </div>

      {/* Camera Info Display */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#fff',
          pointerEvents: 'none',
        }}
        data-testid="camera-info"
      >
        <div>Distance: {camera.distance.toFixed(2)}</div>
        <div>Azimuth: {(camera.azimuthAngle * (180 / Math.PI)).toFixed(1)}°</div>
        <div>Polar: {(camera.polarAngle * (180 / Math.PI)).toFixed(1)}°</div>
      </div>

      {/* Reset Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleReset}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'rgba(76, 175, 80, 0.9)',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
        data-testid="reset-button"
        title="Reset Camera"
      >
        ↺
      </motion.button>

      {/* Dragging Indicator */}
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(76, 175, 80, 0.8)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#fff',
            pointerEvents: 'none',
          }}
          data-testid="dragging-indicator"
        >
          Orbiting...
        </motion.div>
      )}
    </div>
  );
};
