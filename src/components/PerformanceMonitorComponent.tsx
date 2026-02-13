import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PerformanceMonitorComponentProps {
  fps: number;
  frameTime: number;
  showWarnings?: boolean;
  warningThreshold?: number;
  className?: string;
}

/**
 * PerformanceMonitorComponent - Displays FPS counter and frame time
 * Shows performance warnings when frame time exceeds threshold
 */
export const PerformanceMonitorComponent: React.FC<
  PerformanceMonitorComponentProps
> = ({
  fps,
  frameTime,
  showWarnings = true,
  warningThreshold = 16.67,
  className = '',
}) => {
  const isWarning = frameTime > warningThreshold;
  const fpsColor = fps >= 55 ? '#4CAF50' : fps >= 30 ? '#FFC107' : '#f44336';

  return (
    <div
      className={`performance-monitor ${className}`}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#fff',
        minWidth: '150px',
        zIndex: 9999,
      }}
      data-testid="performance-monitor"
    >
      {/* FPS Counter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <span>FPS:</span>
        <span style={{ fontWeight: 'bold', color: fpsColor }}>
          {fps.toFixed(1)}
        </span>
      </div>

      {/* Frame Time */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <span>Frame:</span>
        <span
          style={{
            fontWeight: 'bold',
            color: isWarning ? '#f44336' : '#4CAF50',
          }}
        >
          {frameTime.toFixed(2)}ms
        </span>
      </div>

      {/* Target Frame Time */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#666',
        }}
      >
        <span>Target:</span>
        <span>{warningThreshold.toFixed(2)}ms</span>
      </div>

      {/* Performance Warning */}
      <AnimatePresence>
        {showWarnings && isWarning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: '8px',
              padding: '8px',
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
              borderRadius: '4px',
              border: '1px solid #f44336',
              fontSize: '10px',
              color: '#f44336',
            }}
          >
            ⚠️ Performance Warning
            <div style={{ marginTop: '4px', fontSize: '9px' }}>
              Frame time exceeds target
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FPS Graph (Simple Bar) */}
      <div
        style={{
          marginTop: '8px',
          height: '4px',
          backgroundColor: '#333',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            backgroundColor: fpsColor,
            willChange: 'transform',
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${(fps / 60) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};
