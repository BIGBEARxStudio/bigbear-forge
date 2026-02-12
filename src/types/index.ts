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

// Avatar Framework Types
export type AnimationState = 'idle' | 'attack' | 'defend' | 'victory' | 'defeat' | 'damaged';

export interface CustomizationData {
  bodyParts: {
    head: string;
    torso: string;
    arms: string;
    legs: string;
  };
  colors: {
    skin: string;
    hair: string;
    clothing: string;
  };
  accessories: {
    hat?: string;
    weapon?: string;
    shield?: string;
  };
}

export interface Avatar {
  id: string;
  mesh: any; // THREE.Group
  animationController: any; // AnimationController
  customization: CustomizationData;
}

export interface AvatarSystem {
  initialize(canvas: HTMLCanvasElement): Promise<void>;
  createAvatar(preset: AvatarPreset): Avatar;
  updateAvatar(avatarId: string, customization: CustomizationData): void;
  playAnimation(avatarId: string, state: AnimationState): void;
  dispose(): void;
  isWebGLAvailable(): boolean;
}

export interface AvatarPreset {
  id: string;
  name: string;
  customization: CustomizationData;
}
