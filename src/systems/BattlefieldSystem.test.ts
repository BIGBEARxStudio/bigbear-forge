import { describe, it, expect } from 'vitest';
import {
  calculateDamage,
  placeCardOnPlayerSide,
  placeCardOnOpponentSide,
  applyDamageToPlayer,
  applyDamageToOpponent,
  clearBattlefield,
  resetBattlefield,
  hasPlayerLost,
  hasOpponentLost,
  isBattleDraw,
} from './BattlefieldSystem';
import type { Card, BattlefieldState } from '@/types';

describe('BattlefieldSystem', () => {
  const mockAttacker: Card = {
    id: 'attacker_001',
    name: 'Strong Attacker',
    type: 'attack',
    rarity: 'common',
    stats: { attack: 10, defense: 2, speed: 8 },
    artwork: '/test.png',
  };
  
  const mockDefender: Card = {
    id: 'defender_001',
    name: 'Strong Defender',
    type: 'defense',
    rarity: 'common',
    stats: { attack: 3, defense: 8, speed: 4 },
    artwork: '/test.png',
  };
  
  const initialBattlefield: BattlefieldState = {
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
  
  describe('Damage Calculation', () => {
    it('should calculate damage with defense reduction', () => {
      const damage = calculateDamage(mockAttacker, mockDefender);
      
      // 10 attack - 8 defense = 2 damage
      expect(damage).toBe(2);
    });
    
    it('should deal minimum 1 damage even if defense is higher', () => {
      const weakAttacker: Card = {
        ...mockAttacker,
        stats: { attack: 5, defense: 2, speed: 8 },
      };
      
      const damage = calculateDamage(weakAttacker, mockDefender);
      
      // 5 attack - 8 defense = -3, but minimum is 1
      expect(damage).toBe(1);
    });
    
    it('should deal full attack damage when no defender', () => {
      const damage = calculateDamage(mockAttacker, null);
      
      expect(damage).toBe(mockAttacker.stats.attack);
    });
    
    it('should calculate damage correctly for high attack', () => {
      const strongAttacker: Card = {
        ...mockAttacker,
        stats: { attack: 20, defense: 2, speed: 8 },
      };
      
      const damage = calculateDamage(strongAttacker, mockDefender);
      
      // 20 attack - 8 defense = 12 damage
      expect(damage).toBe(12);
    });
  });
  
  describe('Card Placement', () => {
    it('should place card on player side', () => {
      const battlefield = placeCardOnPlayerSide(initialBattlefield, mockAttacker);
      
      expect(battlefield.playerSide.activeCard).toEqual(mockAttacker);
      expect(battlefield.opponentSide.activeCard).toBeNull();
    });
    
    it('should place card on opponent side', () => {
      const battlefield = placeCardOnOpponentSide(initialBattlefield, mockDefender);
      
      expect(battlefield.opponentSide.activeCard).toEqual(mockDefender);
      expect(battlefield.playerSide.activeCard).toBeNull();
    });
    
    it('should replace existing card on player side', () => {
      const battlefield1 = placeCardOnPlayerSide(initialBattlefield, mockAttacker);
      const battlefield2 = placeCardOnPlayerSide(battlefield1, mockDefender);
      
      expect(battlefield2.playerSide.activeCard).toEqual(mockDefender);
    });
    
    it('should replace existing card on opponent side', () => {
      const battlefield1 = placeCardOnOpponentSide(initialBattlefield, mockDefender);
      const battlefield2 = placeCardOnOpponentSide(battlefield1, mockAttacker);
      
      expect(battlefield2.opponentSide.activeCard).toEqual(mockAttacker);
    });
    
    it('should not affect HP when placing cards', () => {
      const battlefield = placeCardOnPlayerSide(initialBattlefield, mockAttacker);
      
      expect(battlefield.playerSide.hp).toBe(100);
      expect(battlefield.opponentSide.hp).toBe(100);
    });
  });
  
  describe('Damage Application', () => {
    it('should apply damage to player', () => {
      const battlefield = applyDamageToPlayer(initialBattlefield, 25);
      
      expect(battlefield.playerSide.hp).toBe(75);
      expect(battlefield.opponentSide.hp).toBe(100);
    });
    
    it('should apply damage to opponent', () => {
      const battlefield = applyDamageToOpponent(initialBattlefield, 30);
      
      expect(battlefield.opponentSide.hp).toBe(70);
      expect(battlefield.playerSide.hp).toBe(100);
    });
    
    it('should not reduce HP below 0 for player', () => {
      const battlefield = applyDamageToPlayer(initialBattlefield, 150);
      
      expect(battlefield.playerSide.hp).toBe(0);
    });
    
    it('should not reduce HP below 0 for opponent', () => {
      const battlefield = applyDamageToOpponent(initialBattlefield, 200);
      
      expect(battlefield.opponentSide.hp).toBe(0);
    });
    
    it('should handle multiple damage applications', () => {
      let battlefield = initialBattlefield;
      
      battlefield = applyDamageToPlayer(battlefield, 20);
      expect(battlefield.playerSide.hp).toBe(80);
      
      battlefield = applyDamageToPlayer(battlefield, 30);
      expect(battlefield.playerSide.hp).toBe(50);
      
      battlefield = applyDamageToPlayer(battlefield, 25);
      expect(battlefield.playerSide.hp).toBe(25);
    });
  });
  
  describe('Battlefield Clearing and Reset', () => {
    it('should clear all active cards', () => {
      let battlefield = placeCardOnPlayerSide(initialBattlefield, mockAttacker);
      battlefield = placeCardOnOpponentSide(battlefield, mockDefender);
      
      const cleared = clearBattlefield(battlefield);
      
      expect(cleared.playerSide.activeCard).toBeNull();
      expect(cleared.opponentSide.activeCard).toBeNull();
    });
    
    it('should not affect HP when clearing', () => {
      let battlefield = applyDamageToPlayer(initialBattlefield, 30);
      battlefield = applyDamageToOpponent(battlefield, 20);
      battlefield = placeCardOnPlayerSide(battlefield, mockAttacker);
      
      const cleared = clearBattlefield(battlefield);
      
      expect(cleared.playerSide.hp).toBe(70);
      expect(cleared.opponentSide.hp).toBe(80);
    });
    
    it('should reset battlefield to initial state', () => {
      let battlefield = applyDamageToPlayer(initialBattlefield, 50);
      battlefield = applyDamageToOpponent(battlefield, 30);
      battlefield = placeCardOnPlayerSide(battlefield, mockAttacker);
      battlefield = placeCardOnOpponentSide(battlefield, mockDefender);
      
      const reset = resetBattlefield();
      
      expect(reset.playerSide.hp).toBe(100);
      expect(reset.opponentSide.hp).toBe(100);
      expect(reset.playerSide.activeCard).toBeNull();
      expect(reset.opponentSide.activeCard).toBeNull();
    });
  });
  
  describe('Win/Loss Conditions', () => {
    it('should detect player loss when HP is 0', () => {
      const battlefield = applyDamageToPlayer(initialBattlefield, 100);
      
      expect(hasPlayerLost(battlefield)).toBe(true);
      expect(hasOpponentLost(battlefield)).toBe(false);
    });
    
    it('should detect opponent loss when HP is 0', () => {
      const battlefield = applyDamageToOpponent(initialBattlefield, 100);
      
      expect(hasOpponentLost(battlefield)).toBe(true);
      expect(hasPlayerLost(battlefield)).toBe(false);
    });
    
    it('should detect draw when both HP are 0', () => {
      let battlefield = applyDamageToPlayer(initialBattlefield, 100);
      battlefield = applyDamageToOpponent(battlefield, 100);
      
      expect(isBattleDraw(battlefield)).toBe(true);
      expect(hasPlayerLost(battlefield)).toBe(true);
      expect(hasOpponentLost(battlefield)).toBe(true);
    });
    
    it('should not detect loss when HP is above 0', () => {
      let battlefield = applyDamageToPlayer(initialBattlefield, 50);
      battlefield = applyDamageToOpponent(battlefield, 60);
      
      expect(hasPlayerLost(battlefield)).toBe(false);
      expect(hasOpponentLost(battlefield)).toBe(false);
      expect(isBattleDraw(battlefield)).toBe(false);
    });
    
    it('should detect player loss when HP is negative', () => {
      const battlefield = applyDamageToPlayer(initialBattlefield, 150);
      
      expect(hasPlayerLost(battlefield)).toBe(true);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle zero damage', () => {
      const battlefield = applyDamageToPlayer(initialBattlefield, 0);
      
      expect(battlefield.playerSide.hp).toBe(100);
    });
    
    it('should handle negative damage (treated as 0)', () => {
      const battlefield = applyDamageToOpponent(initialBattlefield, -10);
      
      // Negative damage should not heal
      expect(battlefield.opponentSide.hp).toBe(100);
    });
    
    it('should maintain immutability when placing cards', () => {
      const battlefield1 = placeCardOnPlayerSide(initialBattlefield, mockAttacker);
      
      // Original should be unchanged
      expect(initialBattlefield.playerSide.activeCard).toBeNull();
      expect(battlefield1.playerSide.activeCard).toEqual(mockAttacker);
    });
    
    it('should maintain immutability when applying damage', () => {
      const battlefield1 = applyDamageToPlayer(initialBattlefield, 30);
      
      // Original should be unchanged
      expect(initialBattlefield.playerSide.hp).toBe(100);
      expect(battlefield1.playerSide.hp).toBe(70);
    });
  });
});
