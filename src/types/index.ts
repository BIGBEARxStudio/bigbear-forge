// Core type definitions for the game

export interface Card {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats: {
    attack: number;
    defense: number;
    speed: number;
  };
  artwork: string;
}

export interface CardDatabase {
  version: string;
  cards: Card[];
}

export interface BattlefieldState {
  playerSide: {
    activeCard: Card | null;
    hp: number;
    maxHP: number;
  };
  opponentSide: {
    activeCard: Card | null;
    hp: number;
    maxHP: number;
  };
}

export interface CardHandState {
  cards: Card[];
  selectedIndex: number | null;
  isDragging: boolean;
  dragPosition: { x: number; y: number } | null;
}

export interface GameLoopConfig {
  targetFPS: number;
  performanceWarningThreshold: number;
  onTick: (deltaTime: number) => void;
  onPerformanceWarning: (frameTime: number) => void;
}
