import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { 
  combatMachine, 
  serializeCombatState, 
  deserializeCombatState, 
  saveCombatState, 
  loadCombatState, 
  clearCombatState 
} from './CombatStateMachine';
import type { Card } from '@/types';

describe('CombatStateMachine', () => {
  const mockCard: Card = {
    id: 'card_001',
    name: 'Test Attack',
    type: 'attack',
    rarity: 'common',
    stats: { attack: 10, defense: 2, speed: 8 },
    artwork: '/test.png',
  };
  
  it('should follow complete combat flow', () => {
    const actor = createActor(combatMachine);
    actor.start();
    
    expect(actor.getSnapshot().value).toBe('IDLE');
    
    actor.send({ type: 'START_COMBAT' });
    expect(actor.getSnapshot().value).toBe('PLAYER_TURN');
    
    actor.send({ type: 'PLAY_CARD', card: mockCard });
    expect(actor.getSnapshot().value).toBe('CARD_PLAY');
    
    actor.send({ type: 'ANIMATION_COMPLETE' });
    expect(actor.getSnapshot().value).toBe('RESOLVE');
    
    actor.send({ type: 'DAMAGE_APPLIED' });
    expect(actor.getSnapshot().value).toBe('AI_TURN');
    
    actor.send({ type: 'AI_ACTION_COMPLETE' });
    expect(actor.getSnapshot().value).toBe('CHECK_WIN');
    
    actor.send({ type: 'CHECK_COMPLETE', winner: null });
    expect(actor.getSnapshot().value).toBe('PLAYER_TURN');
    
    actor.stop();
  });
  
  it('should serialize and deserialize state', () => {
    const actor = createActor(combatMachine);
    actor.start();
    
    const context = actor.getSnapshot().context;
    const serialized = serializeCombatState(context);
    const deserialized = deserializeCombatState(serialized);
    
    expect(deserialized.playerHP).toBe(context.playerHP);
    expect(deserialized.opponentHP).toBe(context.opponentHP);
    
    actor.stop();
  });
  
  it('should save and load from sessionStorage', () => {
    const actor = createActor(combatMachine);
    actor.start();
    
    actor.send({ type: 'START_COMBAT' });
    const context = actor.getSnapshot().context;
    
    saveCombatState(context);
    const loaded = loadCombatState();
    
    expect(loaded).not.toBeNull();
    expect(loaded?.playerHP).toBe(context.playerHP);
    
    clearCombatState();
    actor.stop();
  });
});
