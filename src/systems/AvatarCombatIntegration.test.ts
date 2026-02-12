import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AvatarCombatIntegration, setupAvatarIntegration } from './AvatarCombatIntegration';
import type { AvatarAnimationTrigger, CombatService } from './AvatarCombatIntegration';
import type { AnimationState } from '../types';

describe('AvatarCombatIntegration', () => {
  let mockAvatarSystem: AvatarAnimationTrigger;
  let integration: AvatarCombatIntegration;
  const playerAvatarId = 'player-avatar';
  const aiAvatarId = 'ai-avatar';

  beforeEach(() => {
    mockAvatarSystem = {
      playAnimation: vi.fn(),
    };
    integration = new AvatarCombatIntegration(mockAvatarSystem, playerAvatarId, aiAvatarId);
  });

  describe('initialization', () => {
    it('should create integration with avatar system and IDs', () => {
      expect(integration).toBeDefined();
    });
  });

  describe('onPlayerAttack', () => {
    it('should trigger player avatar attack animation', () => {
      integration.onPlayerAttack();
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith(playerAvatarId, 'attack');
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledTimes(1);
    });
  });

  describe('onAIAttack', () => {
    it('should trigger AI avatar attack animation', () => {
      integration.onAIAttack();
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith(aiAvatarId, 'attack');
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledTimes(1);
    });
  });

  describe('onPlayerDamaged', () => {
    it('should trigger player avatar damaged animation', () => {
      integration.onPlayerDamaged(10);
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith(playerAvatarId, 'damaged');
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledTimes(1);
    });

    it('should handle zero damage', () => {
      integration.onPlayerDamaged(0);
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith(playerAvatarId, 'damaged');
    });

    it('should handle large damage values', () => {
      integration.onPlayerDamaged(999);
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith(playerAvatarId, 'damaged');
    });
  });

  describe('onAIDamaged', () => {
    it('should trigger AI avatar damaged animation', () => {
      integration.onAIDamaged(15);
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith(aiAvatarId, 'damaged');
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledTimes(1);
    });

    it('should handle zero damage', () => {
      integration.onAIDamaged(0);
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith(aiAvatarId, 'damaged');
    });
  });

  describe('onVictory', () => {
    it('should trigger player victory and AI defeat animations', () => {
      integration.onVictory();
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith(playerAvatarId, 'victory');
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith(aiAvatarId, 'defeat');
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledTimes(2);
    });

    it('should trigger animations in correct order', () => {
      const calls: Array<{ id: string; state: AnimationState }> = [];
      mockAvatarSystem.playAnimation = vi.fn((id, state) => {
        calls.push({ id, state });
      });

      integration.onVictory();
      
      expect(calls[0]).toEqual({ id: playerAvatarId, state: 'victory' });
      expect(calls[1]).toEqual({ id: aiAvatarId, state: 'defeat' });
    });
  });

  describe('onDefeat', () => {
    it('should trigger player defeat and AI victory animations', () => {
      integration.onDefeat();
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith(playerAvatarId, 'defeat');
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith(aiAvatarId, 'victory');
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledTimes(2);
    });

    it('should trigger animations in correct order', () => {
      const calls: Array<{ id: string; state: AnimationState }> = [];
      mockAvatarSystem.playAnimation = vi.fn((id, state) => {
        calls.push({ id, state });
      });

      integration.onDefeat();
      
      expect(calls[0]).toEqual({ id: playerAvatarId, state: 'defeat' });
      expect(calls[1]).toEqual({ id: aiAvatarId, state: 'victory' });
    });
  });

  describe('multiple events', () => {
    it('should handle sequence of combat events', () => {
      integration.onPlayerAttack();
      integration.onAIDamaged(10);
      integration.onAIAttack();
      integration.onPlayerDamaged(8);
      integration.onVictory();
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledTimes(6);
    });

    it('should handle rapid event triggers', () => {
      for (let i = 0; i < 10; i++) {
        integration.onPlayerAttack();
      }
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledTimes(10);
    });
  });
});

describe('setupAvatarIntegration', () => {
  let mockAvatarSystem: AvatarAnimationTrigger;
  let mockCombatService: CombatService;
  let integration: AvatarCombatIntegration;
  let stateCallback: (state: any) => void;

  beforeEach(() => {
    mockAvatarSystem = {
      playAnimation: vi.fn(),
    };
    
    mockCombatService = {
      subscribe: vi.fn((callback) => {
        stateCallback = callback;
        return { unsubscribe: vi.fn() };
      }),
      send: vi.fn(),
    };
    
    integration = new AvatarCombatIntegration(mockAvatarSystem, 'player', 'ai');
  });

  describe('subscription', () => {
    it('should subscribe to combat service', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      expect(mockCombatService.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function', () => {
      const subscription = setupAvatarIntegration(mockCombatService, integration);
      
      expect(subscription).toBeDefined();
      expect(subscription.unsubscribe).toBeDefined();
    });
  });

  describe('CARD_PLAY state', () => {
    it('should trigger player attack on player turn', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      stateCallback({
        matches: (state: string) => state === 'CARD_PLAY',
        context: { currentTurn: 'player' },
      });
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith('player', 'attack');
    });

    it('should trigger AI attack on opponent turn', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      stateCallback({
        matches: (state: string) => state === 'CARD_PLAY',
        context: { currentTurn: 'opponent' },
      });
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith('ai', 'attack');
    });
  });

  describe('RESOLVE state', () => {
    it('should trigger AI damaged on player turn', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      stateCallback({
        matches: (state: string) => state === 'RESOLVE',
        context: {
          currentTurn: 'player',
          selectedCard: { stats: { attack: 15 } },
        },
      });
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith('ai', 'damaged');
    });

    it('should trigger player damaged on opponent turn', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      stateCallback({
        matches: (state: string) => state === 'RESOLVE',
        context: {
          currentTurn: 'opponent',
          selectedCard: { stats: { attack: 20 } },
        },
      });
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith('player', 'damaged');
    });

    it('should handle missing card stats', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      stateCallback({
        matches: (state: string) => state === 'RESOLVE',
        context: {
          currentTurn: 'player',
          selectedCard: null,
        },
      });
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith('ai', 'damaged');
    });
  });

  describe('END state', () => {
    it('should trigger victory animations when player wins', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      stateCallback({
        matches: (state: string) => state === 'END',
        context: { winner: 'player' },
      });
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith('player', 'victory');
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith('ai', 'defeat');
    });

    it('should trigger defeat animations when opponent wins', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      stateCallback({
        matches: (state: string) => state === 'END',
        context: { winner: 'opponent' },
      });
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith('player', 'defeat');
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledWith('ai', 'victory');
    });

    it('should not trigger animations on draw', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      stateCallback({
        matches: (state: string) => state === 'END',
        context: { winner: 'draw' },
      });
      
      expect(mockAvatarSystem.playAnimation).not.toHaveBeenCalled();
    });

    it('should not trigger animations when winner is null', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      stateCallback({
        matches: (state: string) => state === 'END',
        context: { winner: null },
      });
      
      expect(mockAvatarSystem.playAnimation).not.toHaveBeenCalled();
    });
  });

  describe('complete combat flow', () => {
    it('should handle full player victory flow', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      // Player attacks
      stateCallback({
        matches: (state: string) => state === 'CARD_PLAY',
        context: { currentTurn: 'player' },
      });
      
      // AI takes damage
      stateCallback({
        matches: (state: string) => state === 'RESOLVE',
        context: {
          currentTurn: 'player',
          selectedCard: { stats: { attack: 50 } },
        },
      });
      
      // Player wins
      stateCallback({
        matches: (state: string) => state === 'END',
        context: { winner: 'player' },
      });
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledTimes(4);
      expect(mockAvatarSystem.playAnimation).toHaveBeenNthCalledWith(1, 'player', 'attack');
      expect(mockAvatarSystem.playAnimation).toHaveBeenNthCalledWith(2, 'ai', 'damaged');
      expect(mockAvatarSystem.playAnimation).toHaveBeenNthCalledWith(3, 'player', 'victory');
      expect(mockAvatarSystem.playAnimation).toHaveBeenNthCalledWith(4, 'ai', 'defeat');
    });

    it('should handle full opponent victory flow', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      // AI attacks
      stateCallback({
        matches: (state: string) => state === 'CARD_PLAY',
        context: { currentTurn: 'opponent' },
      });
      
      // Player takes damage
      stateCallback({
        matches: (state: string) => state === 'RESOLVE',
        context: {
          currentTurn: 'opponent',
          selectedCard: { stats: { attack: 50 } },
        },
      });
      
      // Opponent wins
      stateCallback({
        matches: (state: string) => state === 'END',
        context: { winner: 'opponent' },
      });
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledTimes(4);
      expect(mockAvatarSystem.playAnimation).toHaveBeenNthCalledWith(1, 'ai', 'attack');
      expect(mockAvatarSystem.playAnimation).toHaveBeenNthCalledWith(2, 'player', 'damaged');
      expect(mockAvatarSystem.playAnimation).toHaveBeenNthCalledWith(3, 'player', 'defeat');
      expect(mockAvatarSystem.playAnimation).toHaveBeenNthCalledWith(4, 'ai', 'victory');
    });

    it('should handle multiple rounds of combat', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      // Round 1: Player attacks
      stateCallback({
        matches: (state: string) => state === 'CARD_PLAY',
        context: { currentTurn: 'player' },
      });
      stateCallback({
        matches: (state: string) => state === 'RESOLVE',
        context: { currentTurn: 'player', selectedCard: { stats: { attack: 10 } } },
      });
      
      // Round 2: AI attacks
      stateCallback({
        matches: (state: string) => state === 'CARD_PLAY',
        context: { currentTurn: 'opponent' },
      });
      stateCallback({
        matches: (state: string) => state === 'RESOLVE',
        context: { currentTurn: 'opponent', selectedCard: { stats: { attack: 10 } } },
      });
      
      // Round 3: Player attacks and wins
      stateCallback({
        matches: (state: string) => state === 'CARD_PLAY',
        context: { currentTurn: 'player' },
      });
      stateCallback({
        matches: (state: string) => state === 'RESOLVE',
        context: { currentTurn: 'player', selectedCard: { stats: { attack: 90 } } },
      });
      stateCallback({
        matches: (state: string) => state === 'END',
        context: { winner: 'player' },
      });
      
      expect(mockAvatarSystem.playAnimation).toHaveBeenCalledTimes(8);
    });
  });

  describe('edge cases', () => {
    it('should handle state without matches function', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      expect(() => {
        stateCallback({
          context: { currentTurn: 'player' },
        } as any);
      }).not.toThrow();
    });

    it('should handle state without context', () => {
      setupAvatarIntegration(mockCombatService, integration);
      
      expect(() => {
        stateCallback({
          matches: (state: string) => state === 'CARD_PLAY',
        } as any);
      }).not.toThrow();
    });

    it('should handle unsubscribe', () => {
      const subscription = setupAvatarIntegration(mockCombatService, integration);
      
      expect(() => {
        subscription.unsubscribe();
      }).not.toThrow();
    });
  });
});
