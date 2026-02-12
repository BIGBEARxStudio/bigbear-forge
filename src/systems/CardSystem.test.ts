import { describe, it, expect } from 'vitest';
import { loadCardDatabase, createDeck, shuffleDeck, getCardById } from './CardSystem';
import { validateCard, validateCardDatabase } from '@/data/cardSchema';
import type { Card } from '@/types';

describe('CardSystem', () => {
  describe('Card Schema Validation', () => {
    it('should validate a correct card', () => {
      const validCard: Card = {
        id: 'test_001',
        name: 'Test Card',
        type: 'attack',
        rarity: 'common',
        stats: { attack: 5, defense: 3, speed: 7 },
        artwork: '/test.png',
      };
      
      expect(validateCard(validCard)).toBe(true);
    });
    
    it('should reject card with missing fields', () => {
      const invalidCard = {
        id: 'test_001',
        name: 'Test Card',
        // missing type, rarity, stats, artwork
      };
      
      expect(validateCard(invalidCard)).toBe(false);
    });
    
    it('should reject card with invalid type', () => {
      const invalidCard = {
        id: 'test_001',
        name: 'Test Card',
        type: 'invalid_type',
        rarity: 'common',
        stats: { attack: 5, defense: 3, speed: 7 },
        artwork: '/test.png',
      };
      
      expect(validateCard(invalidCard)).toBe(false);
    });
    
    it('should reject card with invalid rarity', () => {
      const invalidCard = {
        id: 'test_001',
        name: 'Test Card',
        type: 'attack',
        rarity: 'invalid_rarity',
        stats: { attack: 5, defense: 3, speed: 7 },
        artwork: '/test.png',
      };
      
      expect(validateCard(invalidCard)).toBe(false);
    });
    
    it('should reject card with negative stats', () => {
      const invalidCard = {
        id: 'test_001',
        name: 'Test Card',
        type: 'attack',
        rarity: 'common',
        stats: { attack: -5, defense: 3, speed: 7 },
        artwork: '/test.png',
      };
      
      expect(validateCard(invalidCard)).toBe(false);
    });
  });
  
  describe('Card Database Validation', () => {
    it('should validate a correct database', () => {
      const validDatabase = {
        version: '1.0.0',
        cards: [
          {
            id: 'test_001',
            name: 'Test Card',
            type: 'attack',
            rarity: 'common',
            stats: { attack: 5, defense: 3, speed: 7 },
            artwork: '/test.png',
          },
        ],
      };
      
      expect(validateCardDatabase(validDatabase)).toBe(true);
    });
    
    it('should reject database with missing version', () => {
      const invalidDatabase = {
        cards: [],
      };
      
      expect(validateCardDatabase(invalidDatabase)).toBe(false);
    });
    
    it('should reject database with non-array cards', () => {
      const invalidDatabase = {
        version: '1.0.0',
        cards: 'not an array',
      };
      
      expect(validateCardDatabase(invalidDatabase)).toBe(false);
    });
    
    it('should reject database with invalid cards', () => {
      const invalidDatabase = {
        version: '1.0.0',
        cards: [
          {
            id: 'test_001',
            // missing required fields
          },
        ],
      };
      
      expect(validateCardDatabase(invalidDatabase)).toBe(false);
    });
  });
  
  describe('loadCardDatabase', () => {
    it('should load card database successfully', () => {
      const database = loadCardDatabase();
      
      expect(database).toBeDefined();
      expect(database.version).toBeDefined();
      expect(Array.isArray(database.cards)).toBe(true);
      expect(database.cards.length).toBeGreaterThan(0);
    });
    
    it('should load valid cards', () => {
      const database = loadCardDatabase();
      
      database.cards.forEach(card => {
        expect(validateCard(card)).toBe(true);
      });
    });
  });
  
  describe('shuffleDeck', () => {
    it('should return a deck with same length', () => {
      const database = loadCardDatabase();
      const originalDeck = database.cards.slice(0, 5);
      const shuffled = shuffleDeck(originalDeck);
      
      expect(shuffled.length).toBe(originalDeck.length);
    });
    
    it('should contain same cards', () => {
      const database = loadCardDatabase();
      const originalDeck = database.cards.slice(0, 5);
      const shuffled = shuffleDeck(originalDeck);
      
      // Check that all original cards are in shuffled deck
      originalDeck.forEach(card => {
        expect(shuffled.some(c => c.id === card.id)).toBe(true);
      });
    });
    
    it('should not mutate original deck', () => {
      const database = loadCardDatabase();
      const originalDeck = database.cards.slice(0, 5);
      const originalIds = originalDeck.map(c => c.id);
      
      shuffleDeck(originalDeck);
      
      // Original deck should be unchanged
      expect(originalDeck.map(c => c.id)).toEqual(originalIds);
    });
    
    it('should produce different order (probabilistic)', () => {
      const database = loadCardDatabase();
      const originalDeck = database.cards.slice(0, 10);
      
      // Shuffle multiple times and check if at least one is different
      let foundDifferent = false;
      for (let i = 0; i < 10; i++) {
        const shuffled = shuffleDeck(originalDeck);
        const isDifferent = shuffled.some((card, index) => card.id !== originalDeck[index].id);
        if (isDifferent) {
          foundDifferent = true;
          break;
        }
      }
      
      expect(foundDifferent).toBe(true);
    });
  });
  
  describe('createDeck', () => {
    it('should create deck with specified size', () => {
      const database = loadCardDatabase();
      const deck = createDeck(database, 20);
      
      expect(deck.length).toBe(20);
    });
    
    it('should create deck with default size', () => {
      const database = loadCardDatabase();
      const deck = createDeck(database);
      
      expect(deck.length).toBe(20);
    });
    
    it('should contain valid cards', () => {
      const database = loadCardDatabase();
      const deck = createDeck(database, 20);
      
      deck.forEach(card => {
        expect(validateCard(card)).toBe(true);
      });
    });
    
    it('should throw error for empty database', () => {
      const emptyDatabase = { version: '1.0.0', cards: [] };
      
      expect(() => createDeck(emptyDatabase, 20)).toThrow('Card database is empty');
    });
    
    it('should allow duplicates in deck', () => {
      const database = loadCardDatabase();
      const deck = createDeck(database, 20);
      
      // With random selection, duplicates are expected
      const uniqueIds = new Set(deck.map(c => c.id));
      
      // Deck should have cards (may or may not have duplicates)
      expect(deck.length).toBe(20);
      expect(uniqueIds.size).toBeGreaterThan(0);
      expect(uniqueIds.size).toBeLessThanOrEqual(20);
    });
  });
  
  describe('getCardById', () => {
    it('should find card by ID', () => {
      const database = loadCardDatabase();
      const firstCard = database.cards[0];
      
      const found = getCardById(database, firstCard.id);
      
      expect(found).not.toBeNull();
      expect(found?.id).toBe(firstCard.id);
    });
    
    it('should return null for non-existent ID', () => {
      const database = loadCardDatabase();
      
      const found = getCardById(database, 'non_existent_id');
      
      expect(found).toBeNull();
    });
  });
});
