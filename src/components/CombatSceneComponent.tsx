import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { BattlefieldComponent } from './BattlefieldComponent';
import { CardHandComponent } from './CardHandComponent';
import { AvatarCanvas } from './AvatarCanvas';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { useScreenReader } from '@/hooks/useScreenReader';

export interface CombatSceneComponentProps {
  onVictory?: () => void;
  onDefeat?: () => void;
}

/**
 * CombatSceneComponent - React wrapper for CombatScene
 * Integrates battlefield, card hand, and avatar canvas
 */
export const CombatSceneComponent: React.FC<CombatSceneComponentProps> = ({
  onVictory,
  onDefeat,
}) => {
  // Combat state
  const playerHP = useGameStore((state) => state.combat.playerHP);
  const opponentHP = useGameStore((state) => state.combat.opponentHP);
  const currentTurn = useGameStore((state) => state.combat.currentTurn);

  // Card state
  const playerHand = useGameStore((state) => state.cards.playerHand);
  const selectedCardIndex = useGameStore((state) => state.cards.selectedCardIndex);
  const selectCard = useGameStore((state) => state.selectCard);
  const playCard = useGameStore((state) => state.playCard);

  // Battlefield state
  const battlefield = useGameStore((state) => state.battlefield);

  // Screen reader announcements
  const { announce } = useScreenReader();

  // Announce turn changes
  useEffect(() => {
    if (currentTurn === 'player') {
      announce('Your turn. Select a card to play.', 'polite');
    } else {
      announce('Opponent turn. Please wait.', 'polite');
    }
  }, [currentTurn, announce]);

  // Announce HP changes
  useEffect(() => {
    announce(`Player health: ${playerHP}. Opponent health: ${opponentHP}.`, 'polite');
  }, [playerHP, opponentHP, announce]);

  // Keyboard controls
  useKeyboardControls({
    // Card selection with arrow keys
    onArrowLeft: () => {
      if (selectedCardIndex === null) {
        selectCard(0);
      } else if (selectedCardIndex > 0) {
        selectCard(selectedCardIndex - 1);
      }
    },
    onArrowRight: () => {
      if (selectedCardIndex === null) {
        selectCard(0);
      } else if (selectedCardIndex < playerHand.length - 1) {
        selectCard(selectedCardIndex + 1);
      }
    },
    // Play selected card with Enter or Space
    onEnterActivate: () => {
      if (selectedCardIndex !== null && currentTurn === 'player') {
        playCard(selectedCardIndex);
      }
    },
    onSpaceActivate: () => {
      if (selectedCardIndex !== null && currentTurn === 'player') {
        playCard(selectedCardIndex);
      }
    },
    // Number keys for direct card selection
    onNumberKey: (number) => {
      const cardIndex = number - 1;
      if (cardIndex >= 0 && cardIndex < playerHand.length) {
        if (currentTurn === 'player') {
          selectCard(cardIndex);
          playCard(cardIndex);
        }
      }
    },
    // Escape to deselect card
    onEscape: () => {
      selectCard(null);
    },
    enableNavigation: true,
    enableCardSelection: true,
    enableGameControls: false,
  });

  // Check win/loss conditions
  useEffect(() => {
    if (opponentHP <= 0 && onVictory) {
      announce('Victory! You have defeated your opponent!', 'assertive');
      onVictory();
    } else if (playerHP <= 0 && onDefeat) {
      announce('Defeat! You have been defeated.', 'assertive');
      onDefeat();
    }
  }, [playerHP, opponentHP, onVictory, onDefeat, announce]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gridTemplateRows: '1fr auto',
        gap: '16px',
        width: '100%',
        height: '100%',
        padding: '20px',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      data-testid="combat-scene"
    >
      {/* Avatar Canvas - Left Side */}
      <div
        style={{
          gridRow: '1 / 3',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <AvatarCanvas />
      </div>

      {/* Battlefield - Top Right */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Turn Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: 'center',
            padding: '12px',
            backgroundColor:
              currentTurn === 'player'
                ? 'rgba(76, 175, 80, 0.2)'
                : 'rgba(244, 67, 54, 0.2)',
            borderRadius: '8px',
            border: `2px solid ${
              currentTurn === 'player' ? '#4CAF50' : '#f44336'
            }`,
            fontSize: '18px',
            fontWeight: 'bold',
          }}
          data-testid="turn-indicator"
          role="status"
          aria-live="polite"
          aria-label={`Current turn: ${currentTurn === 'player' ? 'Your turn' : 'Opponent turn'}`}
        >
          {currentTurn === 'player' ? '🎮 Your Turn' : '🤖 Opponent Turn'}
        </motion.div>

        {/* Battlefield */}
        <BattlefieldComponent
          playerCard={battlefield.playerSide.activeCard}
          opponentCard={battlefield.opponentSide.activeCard}
          playerHP={battlefield.playerSide.hp}
          playerMaxHP={battlefield.playerSide.maxHP}
          opponentHP={battlefield.opponentSide.hp}
          opponentMaxHP={battlefield.opponentSide.maxHP}
        />
      </div>

      {/* Card Hand - Bottom Right */}
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <CardHandComponent
          cards={playerHand}
          selectedIndex={selectedCardIndex}
          onCardSelect={selectCard}
          onCardPlay={playCard}
        />
      </div>
    </div>
  );
};
