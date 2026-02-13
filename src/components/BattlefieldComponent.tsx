import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../types';

export interface BattlefieldComponentProps {
  playerCard: Card | null;
  opponentCard: Card | null;
  playerHP: number;
  playerMaxHP: number;
  opponentHP: number;
  opponentMaxHP: number;
  damageNumbers?: Array<{ id: string; value: number; x: number; y: number }>;
  className?: string;
}

/**
 * BattlefieldComponent - Displays the play area with player/opponent sides
 * Shows health bars, active cards, and animated damage numbers
 */
export const BattlefieldComponent: React.FC<BattlefieldComponentProps> = ({
  playerCard,
  opponentCard,
  playerHP,
  playerMaxHP,
  opponentHP,
  opponentMaxHP,
  damageNumbers = [],
  className = '',
}) => {
  const playerHPPercent = (playerHP / playerMaxHP) * 100;
  const opponentHPPercent = (opponentHP / opponentMaxHP) * 100;

  return (
    <div
      className={`battlefield ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '400px',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
      }}
      data-testid="battlefield"
    >
      {/* Opponent Side */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#2a1a1a',
          padding: '20px',
          borderBottom: '2px solid #444',
        }}
      >
        {/* Opponent HP Bar */}
        <div style={{ width: '100%', marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '12px',
              color: '#fff',
            }}
          >
            <span>Opponent</span>
            <span>
              {opponentHP} / {opponentMaxHP}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '20px',
              backgroundColor: '#333',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{
                height: '100%',
                backgroundColor: '#f44336',
                willChange: 'transform',
              }}
              initial={{ width: '100%' }}
              animate={{ width: `${opponentHPPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Opponent Card */}
        {opponentCard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              padding: '12px',
              backgroundColor: '#3a2a2a',
              borderRadius: '8px',
              border: '2px solid #f44336',
              minWidth: '120px',
              textAlign: 'center',
              willChange: 'transform, opacity',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
              {opponentCard.name}
            </div>
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
              ⚔️ {opponentCard.stats.attack} | 🛡️ {opponentCard.stats.defense}
            </div>
          </motion.div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: '2px',
          backgroundColor: '#444',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#1a1a1a',
            padding: '4px 12px',
            borderRadius: '12px',
            border: '2px solid #444',
            fontSize: '12px',
            color: '#666',
          }}
        >
          VS
        </div>
      </div>

      {/* Player Side */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1a2a1a',
          padding: '20px',
          borderTop: '2px solid #444',
        }}
      >
        {/* Player Card */}
        {playerCard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              padding: '12px',
              backgroundColor: '#2a3a2a',
              borderRadius: '8px',
              border: '2px solid #4CAF50',
              minWidth: '120px',
              textAlign: 'center',
              marginBottom: '16px',
              willChange: 'transform, opacity',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
              {playerCard.name}
            </div>
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
              ⚔️ {playerCard.stats.attack} | 🛡️ {playerCard.stats.defense}
            </div>
          </motion.div>
        )}

        {/* Player HP Bar */}
        <div style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '12px',
              color: '#fff',
            }}
          >
            <span>Player</span>
            <span>
              {playerHP} / {playerMaxHP}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '20px',
              backgroundColor: '#333',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{
                height: '100%',
                backgroundColor: '#4CAF50',
                willChange: 'transform',
              }}
              initial={{ width: '100%' }}
              animate={{ width: `${playerHPPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Damage Numbers */}
      <AnimatePresence>
        {damageNumbers.map((damage) => (
          <motion.div
            key={damage.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -50, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              position: 'absolute',
              left: `${damage.x}%`,
              top: `${damage.y}%`,
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#f44336',
              textShadow: '0 0 4px rgba(0, 0, 0, 0.8)',
              pointerEvents: 'none',
              willChange: 'transform, opacity',
            }}
          >
            -{damage.value}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
