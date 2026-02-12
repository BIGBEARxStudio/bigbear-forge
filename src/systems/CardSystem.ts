/**
 * Card System
 * 
 * Handles card database loading, deck generation, and shuffling.
 */

import type { Card } from '@/types';
import type { CardDatabase } from '@/data/cardSchema';
import { validateCardDatabase } from '@/data/cardSchema';
import cardData from '@/data/cards.json';

/**
 * Load card database from JSON
 */
export function loadCardDatabase(): CardDatabase {
  // Validate the imported data
  if (!validateCardDatabase(cardData)) {
    throw new Error('Invalid card database format');
  }
  
  return cardData as CardDatabase;
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Create a deck of 20 cards from the card database
 * Randomly selects cards and shuffles them
 */
export function createDeck(database: CardDatabase, deckSize: number = 20): Card[] {
  if (database.cards.length === 0) {
    throw new Error('Card database is empty');
  }
  
  const deck: Card[] = [];
  
  // Randomly select cards to fill the deck
  for (let i = 0; i < deckSize; i++) {
    const randomIndex = Math.floor(Math.random() * database.cards.length);
    deck.push(database.cards[randomIndex]);
  }
  
  // Shuffle the deck
  return shuffleDeck(deck);
}

/**
 * Get a card by ID from the database
 */
export function getCardById(database: CardDatabase, cardId: string): Card | null {
  return database.cards.find(card => card.id === cardId) || null;
}
