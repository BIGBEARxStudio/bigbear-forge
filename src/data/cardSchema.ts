/**
 * Card Schema Validator
 * 
 * Validates card data against the defined schema to ensure data integrity.
 */

import type { Card } from '@/types';

export interface CardDatabase {
  version: string;
  cards: Card[];
}

/**
 * Validates a card object against the schema
 */
export function validateCard(card: unknown): card is Card {
  if (typeof card !== 'object' || card === null) {
    return false;
  }
  
  const c = card as Record<string, unknown>;
  
  // Check required fields
  if (typeof c.id !== 'string' || c.id.length === 0) return false;
  if (typeof c.name !== 'string' || c.name.length === 0) return false;
  if (typeof c.type !== 'string') return false;
  if (typeof c.rarity !== 'string') return false;
  if (typeof c.artwork !== 'string') return false;
  
  // Validate type enum
  const validTypes = ['attack', 'defense', 'speed', 'special'];
  if (!validTypes.includes(c.type as string)) return false;
  
  // Validate rarity enum
  const validRarities = ['common', 'rare', 'epic', 'legendary'];
  if (!validRarities.includes(c.rarity as string)) return false;
  
  // Validate stats object
  if (typeof c.stats !== 'object' || c.stats === null) return false;
  const stats = c.stats as Record<string, unknown>;
  
  if (typeof stats.attack !== 'number' || stats.attack < 0) return false;
  if (typeof stats.defense !== 'number' || stats.defense < 0) return false;
  if (typeof stats.speed !== 'number' || stats.speed < 0) return false;
  
  return true;
}

/**
 * Validates a card database object against the schema
 */
export function validateCardDatabase(db: unknown): db is CardDatabase {
  if (typeof db !== 'object' || db === null) {
    return false;
  }
  
  const database = db as Record<string, unknown>;
  
  // Check version
  if (typeof database.version !== 'string' || database.version.length === 0) {
    return false;
  }
  
  // Check cards array
  if (!Array.isArray(database.cards)) {
    return false;
  }
  
  // Validate each card
  return database.cards.every(validateCard);
}
