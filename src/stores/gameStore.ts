import { create } from 'zustand';
import { GameLoop } from '@/systems/GameLoop';
import type { Card, BattlefieldState } from '@/types';

interface GameLoopState {
  isRunning: boolean;
  isPaused: boolean;
  fps: number;
  frameTime: number;
}

interface CombatState {
  state: string; // XState machine state
  playerHP: number;
  opponentHP: number;
  currentTurn: 'player' | 'opponent';
}

interface CardState {
  playerHand: Card[];
  opponentHand: Card[];
  playerDeck: Card[];
  opponentDeck: Card[];
  selectedCardIndex: number | null;
}

interface UIState {
  currentScene: string;
  isTransitioning: boolean;
  showPauseMenu: boolean;
}

interface GameStore {
  // State
  gameLoop: GameLoopState;
  combat: CombatState;
  cards: CardState;
  battlefield: BattlefieldState;
  ui: UIState;
  
  // Game Loop instance
  gameLoopInstance: GameLoop | null;
  
  // Actions
  startGameLoop: () => void;
  stopGameLoop: () => void;
  pauseGameLoop: () => void;
  resumeGameLoop: () => void;
  updateGameLoopMetrics: (fps: number, frameTime: number) => void;
  
  // Combat actions
  setCombatState: (state: string) => void;
  setPlayerHP: (hp: number) => void;
  setOpponentHP: (hp: number) => void;
  setCurrentTurn: (turn: 'player' | 'opponent') => void;
  
  // Card actions
  setPlayerHand: (hand: Card[]) => void;
  setOpponentHand: (hand: Card[]) => void;
  setPlayerDeck: (deck: Card[]) => void;
  setOpponentDeck: (deck: Card[]) => void;
  selectCard: (index: number | null) => void;
  playCard: (cardIndex: number) => void;
  drawCard: () => void;
  
  // Battlefield actions
  setBattlefield: (battlefield: BattlefieldState) => void;
  
  // UI actions
  setCurrentScene: (scene: string) => void;
  setIsTransitioning: (isTransitioning: boolean) => void;
  setShowPauseMenu: (show: boolean) => void;
  
  // Scene transition
  transitionScene: (sceneName: string) => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameLoop: {
    isRunning: false,
    isPaused: false,
    fps: 0,
    frameTime: 0,
  },
  
  combat: {
    state: 'IDLE',
    playerHP: 100,
    opponentHP: 100,
    currentTurn: 'player',
  },
  
  cards: {
    playerHand: [],
    opponentHand: [],
    playerDeck: [],
    opponentDeck: [],
    selectedCardIndex: null,
  },
  
  battlefield: {
    playerSide: {
      activeCard: null,
      hp: 100,
      maxHP: 100,
    },
    opponentSide: {
      activeCard: null,
      hp: 100,
      maxHP: 100,
    },
  },
  
  ui: {
    currentScene: 'mainMenu',
    isTransitioning: false,
    showPauseMenu: false,
  },
  
  gameLoopInstance: null,
  
  // Game Loop Actions
  startGameLoop: () => {
    const { gameLoopInstance } = get();
    
    if (!gameLoopInstance) {
      // Create game loop instance
      const loop = new GameLoop({
        targetFPS: 60,
        performanceWarningThreshold: 16.67,
        onTick: (deltaTime) => {
          // Update metrics
          const fps = loop.getFPS();
          const frameTime = loop.getFrameTime();
          get().updateGameLoopMetrics(fps, frameTime);
          
          // Game logic updates happen here
          // (will be integrated with combat state machine later)
        },
        onPerformanceWarning: (frameTime) => {
          console.warn(`Performance warning: Frame time ${frameTime.toFixed(2)}ms exceeds 16.67ms`);
        },
      });
      
      set({ gameLoopInstance: loop });
      loop.start();
    } else {
      gameLoopInstance.start();
    }
    
    set((state) => ({
      gameLoop: { ...state.gameLoop, isRunning: true, isPaused: false },
    }));
  },
  
  stopGameLoop: () => {
    const { gameLoopInstance } = get();
    if (gameLoopInstance) {
      gameLoopInstance.stop();
    }
    
    set((state) => ({
      gameLoop: { ...state.gameLoop, isRunning: false, isPaused: false, fps: 0, frameTime: 0 },
    }));
  },
  
  pauseGameLoop: () => {
    const { gameLoopInstance } = get();
    if (gameLoopInstance) {
      gameLoopInstance.pause();
    }
    
    set((state) => ({
      gameLoop: { ...state.gameLoop, isPaused: true },
    }));
  },
  
  resumeGameLoop: () => {
    const { gameLoopInstance } = get();
    if (gameLoopInstance) {
      gameLoopInstance.resume();
    }
    
    set((state) => ({
      gameLoop: { ...state.gameLoop, isPaused: false },
    }));
  },
  
  updateGameLoopMetrics: (fps, frameTime) => {
    set((state) => ({
      gameLoop: { ...state.gameLoop, fps, frameTime },
    }));
  },
  
  // Combat Actions
  setCombatState: (state) => {
    set((prev) => ({
      combat: { ...prev.combat, state },
    }));
  },
  
  setPlayerHP: (hp) => {
    set((state) => ({
      combat: { ...state.combat, playerHP: hp },
      battlefield: {
        ...state.battlefield,
        playerSide: { ...state.battlefield.playerSide, hp },
      },
    }));
  },
  
  setOpponentHP: (hp) => {
    set((state) => ({
      combat: { ...state.combat, opponentHP: hp },
      battlefield: {
        ...state.battlefield,
        opponentSide: { ...state.battlefield.opponentSide, hp },
      },
    }));
  },
  
  setCurrentTurn: (turn) => {
    set((state) => ({
      combat: { ...state.combat, currentTurn: turn },
    }));
  },
  
  // Card Actions
  setPlayerHand: (hand) => {
    set((state) => ({
      cards: { ...state.cards, playerHand: hand },
    }));
  },
  
  setOpponentHand: (hand) => {
    set((state) => ({
      cards: { ...state.cards, opponentHand: hand },
    }));
  },
  
  setPlayerDeck: (deck) => {
    set((state) => ({
      cards: { ...state.cards, playerDeck: deck },
    }));
  },
  
  setOpponentDeck: (deck) => {
    set((state) => ({
      cards: { ...state.cards, opponentDeck: deck },
    }));
  },
  
  selectCard: (index) => {
    set((state) => ({
      cards: { ...state.cards, selectedCardIndex: index },
    }));
  },
  
  playCard: (cardIndex) => {
    const { cards } = get();
    const card = cards.playerHand[cardIndex];
    
    if (!card) return;
    
    // Remove card from hand
    const newHand = cards.playerHand.filter((_, i) => i !== cardIndex);
    
    set((state) => ({
      cards: {
        ...state.cards,
        playerHand: newHand,
        selectedCardIndex: null,
      },
    }));
    
    // Draw a new card to refill hand
    get().drawCard();
  },
  
  drawCard: () => {
    const { cards } = get();
    
    // Don't draw if hand is full or deck is empty
    if (cards.playerHand.length >= 5 || cards.playerDeck.length === 0) {
      return;
    }
    
    const [drawnCard, ...remainingDeck] = cards.playerDeck;
    
    set((state) => ({
      cards: {
        ...state.cards,
        playerHand: [...state.cards.playerHand, drawnCard],
        playerDeck: remainingDeck,
      },
    }));
  },
  
  // Battlefield Actions
  setBattlefield: (battlefield) => {
    set({ battlefield });
  },
  
  // UI Actions
  setCurrentScene: (scene) => {
    set((state) => ({
      ui: { ...state.ui, currentScene: scene },
    }));
  },
  
  setIsTransitioning: (isTransitioning) => {
    set((state) => ({
      ui: { ...state.ui, isTransitioning },
    }));
  },
  
  setShowPauseMenu: (show) => {
    set((state) => ({
      ui: { ...state.ui, showPauseMenu: show },
    }));
  },
  
  // Scene Transition
  transitionScene: async (sceneName) => {
    set((state) => ({
      ui: { ...state.ui, isTransitioning: true },
    }));
    
    // Transition logic will be implemented in Scene Manager
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    set((state) => ({
      ui: { ...state.ui, currentScene: sceneName, isTransitioning: false },
    }));
  },
}));
