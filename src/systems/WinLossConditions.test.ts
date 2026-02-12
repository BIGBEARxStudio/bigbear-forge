import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { combatMachine } from './CombatStateMachine';
import { hasPlayerLost, hasOpponentLost, isBattleDraw } from './BattlefieldSystem';
import type { Card } from '@/types';

describe('Win/Loss Condition System', () => {
  const mockCard: Card = {
    id: 'card_001',
    name: 'Test Card',
    type: 'attack',
    rarity: 'common',
    stats: { attack: 10, defense: 2, speed: 8 },
    artwork: '/test.png',
  };
  
  describe('Property 17: Win condition triggers on opponent HP zero', () => {
    it('should detect win when opponent HP reaches 0', () => {
      const actor = createActor(combatMachine);
      actor.start();
      
      // Start combat
      actor.send({ type: 'START_COMBAT' });
      
      // Manually set opponent HP to 0
      const context = actor.getSnapshot().context;
      context.opponentHP = 0;
      
      // Check win condition
      expect(hasOpponentLost({ 
        playerSide: { activeCard: null, hp: context.playerHP, maxHP: 100 },
        opponentSide: { activeCard: null, hp: context.opponentHP, maxHP: 100 }
      })).toBe(true);
      
      actor.stop();
    });
    
    it('should transition to END state when opponent HP is 0', () => {
      const actor = createActor(combatMachine);
      actor.start();
      
      actor.send({ type: 'START_COMBAT' });
      actor.send({ type: 'PLAY_CARD', card: mockCard });
      actor.send({ type: 'ANIMATION_COMPLETE' });
      actor.send({ type: 'DAMAGE_APPLIED' });
      actor.send({ type: 'AI_ACTION_COMPLETE' });
      
      // Now in CHECK_WIN state
      expect(actor.getSnapshot().value).toBe('CHECK_WIN');
      
      // Send CHECK_COMPLETE with opponent as winner (player lost)
      actor.send({ type: 'CHECK_COMPLETE', winner: 'player' });
      
      expect(actor.getSnapshot().value).toBe('END');
      expect(actor.getSnapshot().context.winner).toBe('player');
      
      actor.stop();
    });
    
    it('should not detect win when opponent HP is above 0', () => {
      const actor = createActor(combatMachine);
      actor.start();
      
      actor.send({ type: 'START_COMBAT' });
      
      const context = actor.getSnapshot().context;
      context.opponentHP = 50;
      
      expect(hasOpponentLost({ 
        playerSide: { activeCard: null, hp: context.playerHP, maxHP: 100 },
        opponentSide: { activeCard: null, hp: context.opponentHP, maxHP: 100 }
      })).toBe(false);
      
      actor.stop();
    });
  });
  
  describe('Property 18: Loss condition triggers on player HP zero', () => {
    it('should detect loss when player HP reaches 0', () => {
      const actor = createActor(combatMachine);
      actor.start();
      
      actor.send({ type: 'START_COMBAT' });
      
      const context = actor.getSnapshot().context;
      context.playerHP = 0;
      
      expect(hasPlayerLost({ 
        playerSide: { activeCard: null, hp: context.playerHP, maxHP: 100 },
        opponentSide: { activeCard: null, hp: context.opponentHP, maxHP: 100 }
      })).toBe(true);
      
      actor.stop();
    });
    
    it('should transition to END state when player HP is 0', () => {
      const actor = createActor(combatMachine);
      actor.start();
      
      actor.send({ type: 'START_COMBAT' });
      actor.send({ type: 'PLAY_CARD', card: mockCard });
      actor.send({ type: 'ANIMATION_COMPLETE' });
      actor.send({ type: 'DAMAGE_APPLIED' });
      actor.send({ type: 'AI_ACTION_COMPLETE' });
      
      // Now in CHECK_WIN state
      expect(actor.getSnapshot().value).toBe('CHECK_WIN');
      
      // Send CHECK_COMPLETE with opponent as winner
      actor.send({ type: 'CHECK_COMPLETE', winner: 'opponent' });
      
      expect(actor.getSnapshot().value).toBe('END');
      expect(actor.getSnapshot().context.winner).toBe('opponent');
      
      actor.stop();
    });
    
    it('should not detect loss when player HP is above 0', () => {
      const actor = createActor(combatMachine);
      actor.start();
      
      actor.send({ type: 'START_COMBAT' });
      
      const context = actor.getSnapshot().context;
      context.playerHP = 75;
      
      expect(hasPlayerLost({ 
        playerSide: { activeCard: null, hp: context.playerHP, maxHP: 100 },
        opponentSide: { activeCard: null, hp: context.opponentHP, maxHP: 100 }
      })).toBe(false);
      
      actor.stop();
    });
  });
  
  describe('Property 19: Draw condition triggers on simultaneous zero HP', () => {
    it('should detect draw when both HP reach 0', () => {
      const actor = createActor(combatMachine);
      actor.start();
      
      actor.send({ type: 'START_COMBAT' });
      
      const context = actor.getSnapshot().context;
      context.playerHP = 0;
      context.opponentHP = 0;
      
      expect(isBattleDraw({ 
        playerSide: { activeCard: null, hp: context.playerHP, maxHP: 100 },
        opponentSide: { activeCard: null, hp: context.opponentHP, maxHP: 100 }
      })).toBe(true);
      
      actor.stop();
    });
    
    it('should transition to END state with draw winner', () => {
      const actor = createActor(combatMachine);
      actor.start();
      
      actor.send({ type: 'START_COMBAT' });
      actor.send({ type: 'PLAY_CARD', card: mockCard });
      actor.send({ type: 'ANIMATION_COMPLETE' });
      actor.send({ type: 'DAMAGE_APPLIED' });
      actor.send({ type: 'AI_ACTION_COMPLETE' });
      
      // Now in CHECK_WIN state
      expect(actor.getSnapshot().value).toBe('CHECK_WIN');
      
      // Send CHECK_COMPLETE with draw
      actor.send({ type: 'CHECK_COMPLETE', winner: 'draw' });
      
      expect(actor.getSnapshot().value).toBe('END');
      expect(actor.getSnapshot().context.winner).toBe('draw');
      
      actor.stop();
    });
    
    it('should not detect draw when only one HP is 0', () => {
      const actor = createActor(combatMachine);
      actor.start();
      
      actor.send({ type: 'START_COMBAT' });
      
      const context = actor.getSnapshot().context;
      context.playerHP = 0;
      context.opponentHP = 50;
      
      expect(isBattleDraw({ 
        playerSide: { activeCard: null, hp: context.playerHP, maxHP: 100 },
        opponentSide: { activeCard: null, hp: context.opponentHP, maxHP: 100 }
      })).toBe(false);
      
      actor.stop();
    });
    
    it('should not detect draw when both HP are above 0', () => {
      const actor = createActor(combatMachine);
      actor.start();
      
      actor.send({ type: 'START_COMBAT' });
      
      const context = actor.getSnapshot().context;
      context.playerHP = 50;
      context.opponentHP = 60;
      
      expect(isBattleDraw({ 
        playerSide: { activeCard: null, hp: context.playerHP, maxHP: 100 },
        opponentSide: { activeCard: null, hp: context.opponentHP, maxHP: 100 }
      })).toBe(false);
      
      actor.stop();
    });
  });
  
  describe('Combat Flow with Win Conditions', () => {
    it('should continue to next turn when no winner', () => {
      const actor = createActor(combatMachine);
      actor.start();
      
      actor.send({ type: 'START_COMBAT' });
      actor.send({ type: 'PLAY_CARD', card: mockCard });
      actor.send({ type: 'ANIMATION_COMPLETE' });
      actor.send({ type: 'DAMAGE_APPLIED' });
      actor.send({ type: 'AI_ACTION_COMPLETE' });
      
      expect(actor.getSnapshot().value).toBe('CHECK_WIN');
      
      // No winner, continue to next turn
      actor.send({ type: 'CHECK_COMPLETE', winner: null });
      
      expect(actor.getSnapshot().value).toBe('PLAYER_TURN');
      
      actor.stop();
    });
    
    it('should end combat when winner is determined', () => {
      const actor = createActor(combatMachine);
      actor.start();
      
      actor.send({ type: 'START_COMBAT' });
      actor.send({ type: 'PLAY_CARD', card: mockCard });
      actor.send({ type: 'ANIMATION_COMPLETE' });
      actor.send({ type: 'DAMAGE_APPLIED' });
      actor.send({ type: 'AI_ACTION_COMPLETE' });
      
      expect(actor.getSnapshot().value).toBe('CHECK_WIN');
      
      // Winner determined
      actor.send({ type: 'CHECK_COMPLETE', winner: 'player' });
      
      expect(actor.getSnapshot().value).toBe('END');
      expect(actor.getSnapshot().context.winner).toBe('player');
      
      actor.stop();
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle negative HP as loss condition', () => {
      const battlefield = {
        playerSide: { activeCard: null, hp: -10, maxHP: 100 },
        opponentSide: { activeCard: null, hp: 50, maxHP: 100 }
      };
      
      expect(hasPlayerLost(battlefield)).toBe(true);
    });
    
    it('should handle exactly 0 HP as loss condition', () => {
      const battlefield = {
        playerSide: { activeCard: null, hp: 0, maxHP: 100 },
        opponentSide: { activeCard: null, hp: 50, maxHP: 100 }
      };
      
      expect(hasPlayerLost(battlefield)).toBe(true);
    });
    
    it('should handle 1 HP as not lost', () => {
      const battlefield = {
        playerSide: { activeCard: null, hp: 1, maxHP: 100 },
        opponentSide: { activeCard: null, hp: 50, maxHP: 100 }
      };
      
      expect(hasPlayerLost(battlefield)).toBe(false);
    });
  });
});
