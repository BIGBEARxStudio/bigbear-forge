import type { AnimationState } from '../types';

export interface CombatEventListener {
  onPlayerAttack(): void;
  onAIAttack(): void;
  onPlayerDamaged(damage: number): void;
  onAIDamaged(damage: number): void;
  onVictory(): void;
  onDefeat(): void;
}

export interface AvatarAnimationTrigger {
  playAnimation(avatarId: string, state: AnimationState): void;
}

export class AvatarCombatIntegration implements CombatEventListener {
  private avatarSystem: AvatarAnimationTrigger;
  private playerAvatarId: string;
  private aiAvatarId: string;

  constructor(
    avatarSystem: AvatarAnimationTrigger,
    playerAvatarId: string,
    aiAvatarId: string
  ) {
    this.avatarSystem = avatarSystem;
    this.playerAvatarId = playerAvatarId;
    this.aiAvatarId = aiAvatarId;
  }

  onPlayerAttack(): void {
    this.avatarSystem.playAnimation(this.playerAvatarId, 'attack');
  }

  onAIAttack(): void {
    this.avatarSystem.playAnimation(this.aiAvatarId, 'attack');
  }

  onPlayerDamaged(damage: number): void {
    this.avatarSystem.playAnimation(this.playerAvatarId, 'damaged');
  }

  onAIDamaged(damage: number): void {
    this.avatarSystem.playAnimation(this.aiAvatarId, 'damaged');
  }

  onVictory(): void {
    this.avatarSystem.playAnimation(this.playerAvatarId, 'victory');
    this.avatarSystem.playAnimation(this.aiAvatarId, 'defeat');
  }

  onDefeat(): void {
    this.avatarSystem.playAnimation(this.playerAvatarId, 'defeat');
    this.avatarSystem.playAnimation(this.aiAvatarId, 'victory');
  }
}

// XState Integration Helper
export interface CombatStateSubscription {
  unsubscribe: () => void;
}

export interface CombatService {
  subscribe(callback: (state: any) => void): CombatStateSubscription;
  send(event: any): void;
}

export function setupAvatarIntegration(
  combatService: CombatService,
  avatarIntegration: AvatarCombatIntegration
): CombatStateSubscription {
  return combatService.subscribe((state: any) => {
    // Defensive checks
    if (!state || typeof state.matches !== 'function' || !state.context) {
      return;
    }

    // Listen for state transitions and trigger avatar animations
    
    // Card play state - trigger attack animation
    if (state.matches('CARD_PLAY')) {
      const turn = state.context.currentTurn;
      if (turn === 'player') {
        avatarIntegration.onPlayerAttack();
      } else {
        avatarIntegration.onAIAttack();
      }
    }
    
    // Resolve state - trigger damaged animation
    if (state.matches('RESOLVE')) {
      const turn = state.context.currentTurn;
      if (turn === 'player') {
        // Player attacked, AI takes damage
        const damage = state.context.selectedCard?.stats?.attack || 0;
        avatarIntegration.onAIDamaged(damage);
      } else {
        // AI attacked, player takes damage
        const damage = state.context.selectedCard?.stats?.attack || 0;
        avatarIntegration.onPlayerDamaged(damage);
      }
    }
    
    // End state - trigger victory/defeat animations
    if (state.matches('END')) {
      const winner = state.context.winner;
      if (winner === 'player') {
        avatarIntegration.onVictory();
      } else if (winner === 'opponent') {
        avatarIntegration.onDefeat();
      }
      // Draw case - no special animation
    }
  });
}
