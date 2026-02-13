import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../types';

export interface CardComponentProps {
  card: Card;
  isSelected?: boolean;
  isHovered?: boolean;
  isDragging?: boolean;
  onSelect?: () => void;
  onHover?: (isHovered: boolean) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * CardComponent - Displays a single card with stats and visual effects
 * Uses Framer Motion for hover glow, selection outline, and drag preview
 */
export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  isSelected = false,
  isHovered = false,
  isDragging = false,
  onSelect,
  onHover,
  onDragStart,
  onDragEnd,
  style,
  className = '',
}) => {
  return (
    <motion.div
      className={`card ${className}`}
      style={{
        ...style,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'pointer',
        position: 'relative',
        width: '120px',
        height: '180px',
        borderRadius: '8px',
        padding: '12px',
        backgroundColor: '#2a2a2a',
        border: isSelected ? '2px solid #4CAF50' : '2px solid #444',
        boxShadow: isHovered
          ? '0 0 20px rgba(76, 175, 80, 0.6)'
          : '0 4px 8px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        willChange: isHovered || isSelected ? 'transform, opacity' : 'auto',
      }}
      animate={{
        scale: isHovered ? 1.05 : 1,
        y: isSelected ? -10 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      onClick={onSelect}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      draggable
      data-card-id={card.id}
      data-testid="card-component"
    >
      {/* Card Name */}
      <div
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: '8px',
          textAlign: 'center',
        }}
      >
        {card.name}
      </div>

      {/* Card Type Badge */}
      <div
        style={{
          fontSize: '10px',
          color: '#aaa',
          textTransform: 'uppercase',
          textAlign: 'center',
          marginBottom: '8px',
        }}
      >
        {card.type}
      </div>

      {/* Card Stats */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '12px',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>⚔️ Attack:</span>
          <span style={{ fontWeight: 'bold' }}>{card.stats.attack}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>🛡️ Defense:</span>
          <span style={{ fontWeight: 'bold' }}>{card.stats.defense}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>⚡ Speed:</span>
          <span style={{ fontWeight: 'bold' }}>{card.stats.speed}</span>
        </div>
      </div>

      {/* Rarity Indicator */}
      <div
        style={{
          fontSize: '10px',
          color: getRarityColor(card.rarity),
          textAlign: 'center',
          marginTop: '8px',
          textTransform: 'uppercase',
          fontWeight: 'bold',
        }}
      >
        {card.rarity}
      </div>

      {/* Selection Pulse Animation */}
      {isSelected && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '2px solid #4CAF50',
            borderRadius: '8px',
            pointerEvents: 'none',
            willChange: 'opacity',
          }}
          animate={{
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
};

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return '#FFD700';
    case 'epic':
      return '#9C27B0';
    case 'rare':
      return '#2196F3';
    case 'common':
    default:
      return '#9E9E9E';
  }
}
