import { createMachine, assign } from 'xstate';
import type { Card, BattlefieldState } from '@/types';

// Combat context
export interface CombatContext {
  playerHP: number;
  opponentHP: number;
  currentTurn: 'player' | 'opponent';
  selectedCard: Card | null;
  playerHand: Card[];
  opponentHand: Card[];
  battlefield: BattlefieldState;
  winner: 'player' | 'opponent' | 'draw' | null;
}

// Combat events
export type CombatEvent =
  | { type: 'START_COMBAT' }
  | { type: 'PLAY_CARD'; card: Card }
  | { type: 'ANIMATION_COMPLETE' }
  | { type: 'DAMAGE_APPLIED' }
  | { type: 'AI_ACTION_COMPLETE' }
  | { type: 'CHECK_COMPLETE'; winner: 'player' | 'opponent' | 'draw' | null };

// Initial context
const initialContext: CombatContext = {
  playerHP: 100,
  opponentHP: 100,
  currentTurn: 'player',
  selectedCard: null,
  playerHand: [],
  opponentHand: [],
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
  winner: null,
};

// Combat state machine
export const combatMachine = createMachine(
  {
    id: 'combat',
    initial: 'IDLE',
    context: initialContext,
    types: {} as {
      context: CombatContext;
      events: CombatEvent;
    },
    states: {
      IDLE: {
        on: {
          START_COMBAT: {
            target: 'PLAYER_TURN',
            actions: 'initializeCombat',
          },
        },
      },
      PLAYER_TURN: {
        on: {
          PLAY_CARD: {
            target: 'CARD_PLAY',
            actions: 'setSelectedCard',
          },
        },
      },
      CARD_PLAY: {
        on: {
          ANIMATION_COMPLETE: {
            target: 'RESOLVE',
          },
        },
      },
      RESOLVE: {
        entry: 'applyCardEffect',
        on: {
          DAMAGE_APPLIED: {
            target: 'AI_TURN',
            actions: 'switchToOpponent',
          },
        },
      },
      AI_TURN: {
        entry: 'triggerAIAction',
        on: {
          AI_ACTION_COMPLETE: {
            target: 'CHECK_WIN',
            actions: 'switchToPlayer',
          },
        },
      },
      CHECK_WIN: {
        entry: 'checkWinCondition',
        on: {
          CHECK_COMPLETE: [
            {
              target: 'END',
              guard: 'hasWinner',
              actions: 'setWinner',
            },
            {
              target: 'PLAYER_TURN',
            },
          ],
        },
      },
      END: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      initializeCombat: assign({
        playerHP: 100,
        opponentHP: 100,
        currentTurn: 'player' as const,
        selectedCard: null,
        winner: null,
      }),
      
      setSelectedCard: assign({
        selectedCard: ({ event }) => {
          if (event.type === 'PLAY_CARD') {
            return event.card;
          }
          return null;
        },
      }),
      
      applyCardEffect: assign({
        opponentHP: ({ context }) => {
          if (!context.selectedCard) return context.opponentHP;
          
          const damage = context.selectedCard.stats.attack;
          return Math.max(0, context.opponentHP - damage);
        },
        battlefield: ({ context }) => ({
          ...context.battlefield,
          playerSide: {
            ...context.battlefield.playerSide,
            activeCard: context.selectedCard,
          },
        }),
      }),
      
      switchToOpponent: assign({
        currentTurn: 'opponent' as const,
      }),
      
      switchToPlayer: assign({
        currentTurn: 'player' as const,
      }),
      
      checkWinCondition: assign({
        winner: ({ context }) => {
          if (context.playerHP <= 0 && context.opponentHP <= 0) {
            return 'draw';
          }
          if (context.playerHP <= 0) {
            return 'opponent';
          }
          if (context.opponentHP <= 0) {
            return 'player';
          }
          return null;
        },
      }),
      
      setWinner: assign({
        winner: ({ event }) => {
          if (event.type === 'CHECK_COMPLETE') {
            return event.winner;
          }
          return null;
        },
      }),
      
      triggerAIAction: () => {
        // AI action will be triggered externally
        // This is just a marker action
      },
    },
    
    guards: {
      hasWinner: ({ event }) => {
        if (event.type === 'CHECK_COMPLETE') {
          return event.winner !== null;
        }
        return false;
      },
    },
  }
);

// State persistence helpers
export const serializeCombatState = (context: CombatContext): string => {
  return JSON.stringify(context);
};

export const deserializeCombatState = (serialized: string): CombatContext => {
  try {
    return JSON.parse(serialized);
  } catch {
    return initialContext;
  }
};

export const saveCombatState = (context: CombatContext): void => {
  try {
    sessionStorage.setItem('combat_state', serializeCombatState(context));
  } catch (error) {
    console.warn('Failed to save combat state:', error);
  }
};

export const loadCombatState = (): CombatContext | null => {
  try {
    const serialized = sessionStorage.getItem('combat_state');
    if (!serialized) return null;
    return deserializeCombatState(serialized);
  } catch (error) {
    console.warn('Failed to load combat state:', error);
    return null;
  }
};

export const clearCombatState = (): void => {
  try {
    sessionStorage.removeItem('combat_state');
  } catch (error) {
    console.warn('Failed to clear combat state:', error);
  }
};
