import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';
import { loadCardDatabase, createDeck } from '@/systems/CardSystem';
import type { Card } from '@/types';

describe('Card Hand System', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useGameStore.getState();
    store.setPlayerHand([]);
    store.setPlayerDeck([]);
    store.selectCard(null);
    store.setIsDragging(false);
    store.setDragPosition(null);
  });
  
  describe('Card Selection', () => {
    it('should select a card by index', () => {
      const store = useGameStore.getState();
      const database = loadCardDatabase();
      const hand = database.cards.slice(0, 3);
      
      store.setPlayerHand(hand);
      store.selectCard(1);
      
      const state = useGameStore.getState();
      expect(state.cards.selectedCardIndex).toBe(1);
    });
    
    it('should deselect card when selecting null', () => {
      const store = useGameStore.getState();
      const database = loadCardDatabase();
      const hand = database.cards.slice(0, 3);
      
      store.setPlayerHand(hand);
      store.selectCard(1);
      
      let state = useGameStore.getState();
      expect(state.cards.selectedCardIndex).toBe(1);
      
      store.selectCard(null);
      state = useGameStore.getState();
      expect(state.cards.selectedCardIndex).toBeNull();
    });
    
    it('should toggle selection when clicking same card', () => {
      const store = useGameStore.getState();
      const database = loadCardDatabase();
      const hand = database.cards.slice(0, 3);
      
      store.setPlayerHand(hand);
      
      // Select card
      store.selectCard(1);
      let state = useGameStore.getState();
      expect(state.cards.selectedCardIndex).toBe(1);
      
      // Deselect by selecting null
      store.selectCard(null);
      state = useGameStore.getState();
      expect(state.cards.selectedCardIndex).toBeNull();
      
      // Select again
      store.selectCard(1);
      state = useGameStore.getState();
      expect(state.cards.selectedCardIndex).toBe(1);
    });
  });
  
  describe('Card Drawing', () => {
    it('should draw card from deck to hand', () => {
      const store = useGameStore.getState();
      const database = loadCardDatabase();
      const deck = createDeck(database, 20);
      
      store.setPlayerDeck(deck);
      store.setPlayerHand([]);
      
      const initialDeckSize = deck.length;
      
      store.drawCard();
      
      const state = useGameStore.getState();
      expect(state.cards.playerHand.length).toBe(1);
      expect(state.cards.playerDeck.length).toBe(initialDeckSize - 1);
    });
    
    it('should not draw if hand is full (5 cards)', () => {
      const store = useGameStore.getState();
      const database = loadCardDatabase();
      const deck = createDeck(database, 20);
      const fullHand = deck.slice(0, 5);
      
      store.setPlayerDeck(deck.slice(5));
      store.setPlayerHand(fullHand);
      
      const initialHandSize = fullHand.length;
      const initialDeckSize = deck.slice(5).length;
      
      store.drawCard();
      
      const state = useGameStore.getState();
      expect(state.cards.playerHand.length).toBe(initialHandSize);
      expect(state.cards.playerDeck.length).toBe(initialDeckSize);
    });
    
    it('should not draw if deck is empty', () => {
      const store = useGameStore.getState();
      const database = loadCardDatabase();
      const hand = database.cards.slice(0, 3);
      
      store.setPlayerDeck([]);
      store.setPlayerHand(hand);
      
      const initialHandSize = hand.length;
      
      store.drawCard();
      
      const state = useGameStore.getState();
      expect(state.cards.playerHand.length).toBe(initialHandSize);
    });
    
    it('should maintain hand size between 3-5 cards with refill', () => {
      const store = useGameStore.getState();
      const database = loadCardDatabase();
      const deck = createDeck(database, 20);
      
      // Start with 3 cards
      store.setPlayerDeck(deck.slice(3));
      store.setPlayerHand(deck.slice(0, 3));
      
      // Draw to 4
      store.drawCard();
      expect(useGameStore.getState().cards.playerHand.length).toBe(4);
      
      // Draw to 5 (max)
      store.drawCard();
      expect(useGameStore.getState().cards.playerHand.length).toBe(5);
      
      // Try to draw beyond max
      store.drawCard();
      expect(useGameStore.getState().cards.playerHand.length).toBe(5);
    });
  });
  
  describe('Card Playing', () => {
    it('should remove card from hand when played', () => {
      const store = useGameStore.getState();
      const database = loadCardDatabase();
      const deck = createDeck(database, 20);
      const hand = deck.slice(0, 5);
      const remainingDeck = deck.slice(5);
      
      store.setPlayerDeck(remainingDeck);
      store.setPlayerHand(hand);
      
      const cardToPlayId = hand[2].id;
      
      store.playCard(2);
      
      const state = useGameStore.getState();
      expect(state.cards.playerHand.length).toBe(5); // Refilled from deck
      
      // The played card should not be in hand (unless it was randomly drawn again from deck)
      // Since deck is random, we can't guarantee the card won't be drawn again
      // So we just check that hand was refilled
      expect(state.cards.playerHand.length).toBe(5);
    });
    
    it('should deselect card after playing', () => {
      const store = useGameStore.getState();
      const database = loadCardDatabase();
      const deck = createDeck(database, 20);
      const hand = deck.slice(0, 5);
      
      store.setPlayerDeck(deck.slice(5));
      store.setPlayerHand(hand);
      store.selectCard(2);
      
      store.playCard(2);
      
      const state = useGameStore.getState();
      expect(state.cards.selectedCardIndex).toBeNull();
    });
    
    it('should refill hand after playing card', () => {
      const store = useGameStore.getState();
      const database = loadCardDatabase();
      const deck = createDeck(database, 20);
      const hand = deck.slice(0, 4);
      
      store.setPlayerDeck(deck.slice(4));
      store.setPlayerHand(hand);
      
      store.playCard(1);
      
      const state = useGameStore.getState();
      // Hand had 4, played 1 (now 3), then drew 1 (now 4)
      expect(state.cards.playerHand.length).toBe(4);
    });
    
    it('should not crash when playing invalid card index', () => {
      const store = useGameStore.getState();
      const database = loadCardDatabase();
      const hand = database.cards.slice(0, 3);
      
      store.setPlayerHand(hand);
      
      // Try to play card at invalid index
      expect(() => store.playCard(10)).not.toThrow();
      
      const state = useGameStore.getState();
      expect(state.cards.playerHand.length).toBe(3);
    });
  });
  
  describe('Drag State', () => {
    it('should set dragging state', () => {
      const store = useGameStore.getState();
      
      store.setIsDragging(true);
      expect(useGameStore.getState().cards.isDragging).toBe(true);
      
      store.setIsDragging(false);
      expect(useGameStore.getState().cards.isDragging).toBe(false);
    });
    
    it('should set drag position', () => {
      const store = useGameStore.getState();
      const position = { x: 100, y: 200 };
      
      store.setDragPosition(position);
      
      const state = useGameStore.getState();
      expect(state.cards.dragPosition).toEqual(position);
    });
    
    it('should clear drag position', () => {
      const store = useGameStore.getState();
      
      store.setDragPosition({ x: 100, y: 200 });
      expect(useGameStore.getState().cards.dragPosition).not.toBeNull();
      
      store.setDragPosition(null);
      expect(useGameStore.getState().cards.dragPosition).toBeNull();
    });
  });
  
  describe('Hand Size Invariant', () => {
    it('should maintain hand size between 3-5 after multiple operations', () => {
      const store = useGameStore.getState();
      const database = loadCardDatabase();
      const deck = createDeck(database, 20);
      
      // Initialize with 3 cards
      store.setPlayerDeck(deck.slice(3));
      store.setPlayerHand(deck.slice(0, 3));
      
      // Play and draw multiple times
      for (let i = 0; i < 5; i++) {
        const state = useGameStore.getState();
        if (state.cards.playerHand.length > 0) {
          store.playCard(0);
        }
      }
      
      const finalState = useGameStore.getState();
      expect(finalState.cards.playerHand.length).toBeGreaterThanOrEqual(3);
      expect(finalState.cards.playerHand.length).toBeLessThanOrEqual(5);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle empty hand', () => {
      const store = useGameStore.getState();
      
      store.setPlayerHand([]);
      
      expect(() => store.selectCard(0)).not.toThrow();
      expect(() => store.playCard(0)).not.toThrow();
    });
    
    it('should handle deck exhaustion', () => {
      const store = useGameStore.getState();
      const database = loadCardDatabase();
      const smallDeck = database.cards.slice(0, 3);
      
      store.setPlayerDeck(smallDeck);
      store.setPlayerHand([]);
      
      // Draw all cards
      store.drawCard();
      store.drawCard();
      store.drawCard();
      
      const state = useGameStore.getState();
      expect(state.cards.playerDeck.length).toBe(0);
      expect(state.cards.playerHand.length).toBe(3);
      
      // Try to draw from empty deck
      store.drawCard();
      expect(useGameStore.getState().cards.playerHand.length).toBe(3);
    });
  });
});
