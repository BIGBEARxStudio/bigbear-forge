import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../types';
import { CardComponent } from './CardComponent';

export interface CardHandComponentProps {
  cards: Card[];
  selectedIndex: number | null;
  onCardSelect: (index: number) => void;
  onCardPlay: (index: number) => void;
  maxCards?: number;
  className?: string;
}

/**
 * CardHandComponent - Displays 3-5 cards in hand with selection and drag support
 * Integrates with Zustand store for state management
 */
export const CardHandComponent: React.FC<CardHandComponentProps> = ({
  cards,
  selectedIndex,
  onCardSelect,
  onCardPlay,
  maxCards = 5,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);

  const handleCardClick = (index: number) => {
    if (selectedIndex === index) {
      // Double-click to play
      onCardPlay(index);
    } else {
      onCardSelect(index);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
    onCardSelect(index);
  };

  const handleDragEnd = (index: number) => {
    setDraggingIndex(null);
    if (selectedIndex === index) {
      onCardPlay(index);
    }
  };

  return (
    <div
      className={`card-hand ${className}`}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '16px',
        padding: '20px',
        minHeight: '220px',
      }}
      data-testid="card-hand"
    >
      {cards.length === 0 ? (
        <div
          style={{
            color: '#666',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          No cards in hand
        </div>
      ) : (
        cards.map((card, index) => (
          <motion.div
            key={`${card.id}-${index}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              delay: index * 0.05,
            }}
          >
            <CardComponent
              card={card}
              isSelected={selectedIndex === index}
              isHovered={hoveredIndex === index}
              isDragging={draggingIndex === index}
              onSelect={() => handleCardClick(index)}
              onHover={(isHovered) =>
                setHoveredIndex(isHovered ? index : null)
              }
              onDragStart={() => handleDragStart(index)}
              onDragEnd={() => handleDragEnd(index)}
            />
          </motion.div>
        ))
      )}

      {/* Hand Size Indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          fontSize: '12px',
          color: '#666',
        }}
      >
        {cards.length} / {maxCards}
      </div>
    </div>
  );
};
