import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from './gameStore';
import type { Card } from '@/types';

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useGameStore.getState();
    store.stopGameLoop();
    
    // Reset to initial state
    useGameStore.setState({
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
    });
  });
  
  describe('Game Loop Integration', () => {
    it('should start game loop and update state', () => {
      const store = useGameStore.getState();
      
      store.startGameLoop();
      
      const state = useGameStore.getState();
      expect(state.gameLoop.isRunning).toBe(true);
      expect(state.gameLoop.isPaused).toBe(false);
      expect(state.gameLoopInstance).not.toBeNull();
      
      store.stopGameLoop();
    });
    
    it('should pause and resume game loop', () => {
      const store = useGameStore.getState();
      
      store.startGameLoop();
      store.pauseGameLoop();
      
      let state = useGameStore.getState();
      expect(state.gameLoop.isPaused).toBe(true);
      
      store.resumeGameLoop();
      
      state = useGameStore.getState();
      expect(state.gameLoop.isPaused).toBe(false);
      
      store.stopGameLoop();
    });
    
    it('should update FPS and frame time metrics', () => {
      const store = useGameStore.getState();
      
      store.updateGameLoopMetrics(60, 16.67);
      
      const state = useGameStore.getState();
      expect(state.gameLoop.fps).toBe(60);
      expect(state.gameLoop.frameTime).toBe(16.67);
    });
    
    it('should stop game loop and reset metrics', () => {
      const store = useGameStore.getState();
      
      store.startGameLoop();
      store.updateGameLoopMetrics(60, 16.67);
      store.stopGameLoop();
      
      const state = useGameStore.getState();
      expect(state.gameLoop.isRunning).toBe(false);
      expect(state.gameLoop.fps).toBe(0);
      expect(state.gameLoop.frameTime).toBe(0);
    });
  });
  
  describe('Combat State Management', () => {
    it('should update combat state', () => {
      const store = useGameStore.getState();
      
      store.setCombatState('PLAYER_TURN');
      
      const state = useGameStore.getState();
      expect(state.combat.state).toBe('PLAYER_TURN');
    });
    
    it('should update player HP', () => {
      const store = useGameStore.getState();
      
      store.setPlayerHP(75);
      
      const state = useGameStore.getState();
      expect(state.combat.playerHP).toBe(75);
      expect(state.battlefield.playerSide.hp).toBe(75);
    });
    
    it('should update opponent HP', () => {
      const store = useGameStore.getState();
      
      store.setOpponentHP(50);
      
      const state = useGameStore.getState();
      expect(state.combat.opponentHP).toBe(50);
      expect(state.battlefield.opponentSide.hp).toBe(50);
    });
    
    it('should switch current turn', () => {
      const store = useGameStore.getState();
      
      store.setCurrentTurn('opponent');
      
      const state = useGameStore.getState();
      expect(state.combat.currentTurn).toBe('opponent');
    });
  });
  
  describe('Card State Management', () => {
    const mockCard: Card = {
      id: 'card_001',
      name: 'Test Card',
      type: 'attack',
      rarity: 'common',
      stats: { attack: 5, defense: 2, speed: 8 },
      artwork: '/test.png',
    };
    
    it('should set player hand', () => {
      const store = useGameStore.getState();
      
      store.setPlayerHand([mockCard]);
      
      const state = useGameStore.getState();
      expect(state.cards.playerHand).toHaveLength(1);
      expect(state.cards.playerHand[0]).toEqual(mockCard);
    });
    
    it('should select and deselect card', () => {
      const store = useGameStore.getState();
      
      store.setPlayerHand([mockCard]);
      store.selectCard(0);
      
      let state = useGameStore.getState();
      expect(state.cards.selectedCardIndex).toBe(0);
      
      store.selectCard(null);
      
      state = useGameStore.getState();
      expect(state.cards.selectedCardIndex).toBeNull();
    });
    
    it('should play card and remove from hand', () => {
      const store = useGameStore.getState();
      const deck = [mockCard, { ...mockCard, id: 'card_002' }];
      
      store.setPlayerHand([mockCard]);
      store.setPlayerDeck(deck);
      store.playCard(0);
      
      const state = useGameStore.getState();
      expect(state.cards.playerHand).toHaveLength(1); // Refilled from deck
      expect(state.cards.selectedCardIndex).toBeNull();
    });
    
    it('should draw card from deck', () => {
      const store = useGameStore.getState();
      const deck = [mockCard, { ...mockCard, id: 'card_002' }];
      
      store.setPlayerDeck(deck);
      store.drawCard();
      
      const state = useGameStore.getState();
      expect(state.cards.playerHand).toHaveLength(1);
      expect(state.cards.playerDeck).toHaveLength(1);
    });
    
    it('should not draw card if hand is full', () => {
      const store = useGameStore.getState();
      const fullHand = Array(5).fill(mockCard);
      const deck = [mockCard];
      
      store.setPlayerHand(fullHand);
      store.setPlayerDeck(deck);
      store.drawCard();
      
      const state = useGameStore.getState();
      expect(state.cards.playerHand).toHaveLength(5);
      expect(state.cards.playerDeck).toHaveLength(1);
    });
    
    it('should not draw card if deck is empty', () => {
      const store = useGameStore.getState();
      
      store.setPlayerHand([mockCard]);
      store.setPlayerDeck([]);
      store.drawCard();
      
      const state = useGameStore.getState();
      expect(state.cards.playerHand).toHaveLength(1);
    });
  });
  
  describe('UI State Management', () => {
    it('should change current scene', () => {
      const store = useGameStore.getState();
      
      store.setCurrentScene('combat');
      
      const state = useGameStore.getState();
      expect(state.ui.currentScene).toBe('combat');
    });
    
    it('should toggle pause menu', () => {
      const store = useGameStore.getState();
      
      store.setShowPauseMenu(true);
      
      let state = useGameStore.getState();
      expect(state.ui.showPauseMenu).toBe(true);
      
      store.setShowPauseMenu(false);
      
      state = useGameStore.getState();
      expect(state.ui.showPauseMenu).toBe(false);
    });
    
    it('should handle scene transition', async () => {
      const store = useGameStore.getState();
      
      const transitionPromise = store.transitionScene('combat');
      
      // Should be transitioning
      let state = useGameStore.getState();
      expect(state.ui.isTransitioning).toBe(true);
      
      await transitionPromise;
      
      // Should have completed transition
      state = useGameStore.getState();
      expect(state.ui.isTransitioning).toBe(false);
      expect(state.ui.currentScene).toBe('combat');
    });
  });
});
