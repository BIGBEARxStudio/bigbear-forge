/**
 * Battlefield System
 * 
 * Handles battlefield state, damage calculation, and card placement logic.
 */

import type { Card, BattlefieldState } from '@/types';

/**
 * Calculate damage dealt by attacker to defender
 * Damage = attacker.attack - defender.defense (minimum 1)
 */
export function calculateDamage(attacker: Card, defender: Card | null): number {
  if (!defender) {
    // No defender, full attack damage
    return attacker.stats.attack;
  }
  
  // Calculate damage with defense reduction
  const rawDamage = attacker.stats.attack - defender.stats.defense;
  
  // Minimum 1 damage
  return Math.max(1, rawDamage);
}

/**
 * Place a card on the player's side of the battlefield
 */
export function placeCardOnPlayerSide(
  battlefield: BattlefieldState,
  card: Card
): BattlefieldState {
  return {
    ...battlefield,
    playerSide: {
      ...battlefield.playerSide,
      activeCard: card,
    },
  };
}

/**
 * Place a card on the opponent's side of the battlefield
 */
export function placeCardOnOpponentSide(
  battlefield: BattlefieldState,
  card: Card
): BattlefieldState {
  return {
    ...battlefield,
    opponentSide: {
      ...battlefield.opponentSide,
      activeCard: card,
    },
  };
}

/**
 * Apply damage to player side
 */
export function applyDamageToPlayer(
  battlefield: BattlefieldState,
  damage: number
): BattlefieldState {
  // Clamp damage to non-negative
  const clampedDamage = Math.max(0, damage);
  const newHP = Math.max(0, battlefield.playerSide.hp - clampedDamage);
  
  return {
    ...battlefield,
    playerSide: {
      ...battlefield.playerSide,
      hp: newHP,
    },
  };
}

/**
 * Apply damage to opponent side
 */
export function applyDamageToOpponent(
  battlefield: BattlefieldState,
  damage: number
): BattlefieldState {
  // Clamp damage to non-negative
  const clampedDamage = Math.max(0, damage);
  const newHP = Math.max(0, battlefield.opponentSide.hp - clampedDamage);
  
  return {
    ...battlefield,
    opponentSide: {
      ...battlefield.opponentSide,
      hp: newHP,
    },
  };
}

/**
 * Clear the battlefield (remove all active cards)
 */
export function clearBattlefield(battlefield: BattlefieldState): BattlefieldState {
  return {
    ...battlefield,
    playerSide: {
      ...battlefield.playerSide,
      activeCard: null,
    },
    opponentSide: {
      ...battlefield.opponentSide,
      activeCard: null,
    },
  };
}

/**
 * Reset battlefield to initial state
 */
export function resetBattlefield(): BattlefieldState {
  return {
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
  };
}

/**
 * Check if player has lost (HP <= 0)
 */
export function hasPlayerLost(battlefield: BattlefieldState): boolean {
  return battlefield.playerSide.hp <= 0;
}

/**
 * Check if opponent has lost (HP <= 0)
 */
export function hasOpponentLost(battlefield: BattlefieldState): boolean {
  return battlefield.opponentSide.hp <= 0;
}

/**
 * Check if battle is a draw (both HP <= 0)
 */
export function isBattleDraw(battlefield: BattlefieldState): boolean {
  return battlefield.playerSide.hp <= 0 && battlefield.opponentSide.hp <= 0;
}
