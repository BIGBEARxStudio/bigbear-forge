import { Scene } from '../systems/SceneManager';
import { WebAudioManager } from '../systems/WebAudioManager';
import { GameLoop } from '../systems/GameLoop';
import { createMachine, interpret } from 'xstate';
import { useGameStore } from '../stores/gameStore';
import { AvatarCombatIntegration, setupAvatarIntegration, CombatStateSubscription } from '../systems/AvatarCombatIntegration';

/**
 * CombatScene - Main gameplay scene
 * Manages combat state machine, game loop, and battle UI
 */
export class CombatScene implements Scene {
  name = 'combat';
  private audioManager: WebAudioManager | null = null;
  private gameLoop: GameLoop | null = null;
  private combatMachine: any | null = null;
  private onVictoryCallback: (() => void) | null = null;
  private onDefeatCallback: (() => void) | null = null;
  private avatarIntegration: AvatarCombatIntegration | null = null;
  private avatarSubscription: CombatStateSubscription | null = null;

  constructor(audioManager?: WebAudioManager, gameLoop?: GameLoop) {
    this.audioManager = audioManager || null;
    this.gameLoop = gameLoop || null;
  }

  /**
   * Set callback for victory condition
   */
  setOnVictory(callback: () => void): void {
    this.onVictoryCallback = callback;
  }

  /**
   * Set callback for defeat condition
   */
  setOnDefeat(callback: () => void): void {
    this.onDefeatCallback = callback;
  }

  async load(): Promise<void> {
    // Lazy load combat assets
    await Promise.all([
      this.loadCardAssets(),
      this.loadCombatUI(),
    ]);
  }

  enter(): void {
    // Initialize avatar system
    this.initializeAvatars();

    // Initialize combat state machine
    this.initializeCombatMachine();

    // Wire up avatar animations to combat events
    this.setupAvatarCombatIntegration();

    // Start combat music
    if (this.audioManager) {
      this.audioManager.playMusic('combatMusic', true);
    }

    // Start game loop
    if (this.gameLoop) {
      this.gameLoop.start();
    }

    // Mount combat UI
    this.mountUI();
  }

  exit(): void {
    // Save avatar customizations
    this.saveAvatarCustomizations();

    // Pause game loop
    if (this.gameLoop) {
      this.gameLoop.pause();
    }

    // Stop combat music
    if (this.audioManager) {
      this.audioManager.stopMusic();
    }

    // Unmount UI
    this.unmountUI();
  }

  update(_deltaTime: number): void {
    // Update combat state machine
    // In real implementation, this would update based on game state
  }

  cleanup(): void {
    // Unsubscribe from avatar integration
    if (this.avatarSubscription) {
      this.avatarSubscription.unsubscribe();
      this.avatarSubscription = null;
    }

    // Dispose avatar system
    this.disposeAvatars();

    // Stop state machine
    if (this.combatMachine) {
      this.combatMachine.stop();
      this.combatMachine = null;
    }

    // Stop game loop
    if (this.gameLoop) {
      this.gameLoop.stop();
    }

    // Clear timelines
    // Release card assets
    this.onVictoryCallback = null;
    this.onDefeatCallback = null;
    this.avatarIntegration = null;
  }

  /**
   * Trigger victory (for testing or programmatic use)
   */
  triggerVictory(): void {
    if (this.onVictoryCallback) {
      this.onVictoryCallback();
    }
  }

  /**
   * Trigger defeat (for testing or programmatic use)
   */
  triggerDefeat(): void {
    if (this.onDefeatCallback) {
      this.onDefeatCallback();
    }
  }

  private async loadCardAssets(): Promise<void> {
    // Load card images, animations, etc.
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  private async loadCombatUI(): Promise<void> {
    // Load React components for combat UI
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  private initializeCombatMachine(): void {
    // Create a minimal combat machine for testing
    const machine = createMachine({
      id: 'combat',
      initial: 'IDLE',
      context: {
        playerHP: 100,
        opponentHP: 100,
        currentTurn: 'player' as 'player' | 'opponent',
        selectedCard: null,
        playerDeck: [],
        opponentDeck: [],
        playerHand: [],
        opponentHand: [],
        winner: null,
      },
      states: {
        IDLE: {
          on: { START_COMBAT: 'PLAYER_TURN' },
        },
        PLAYER_TURN: {},
        END: {
          type: 'final',
        },
      },
    });

    this.combatMachine = interpret(machine);
    this.combatMachine.start();
  }

  private mountUI(): void {
    const container = document.getElementById('scene-container');
    if (container) {
      container.innerHTML = `
        <div id="combat-scene">
          <div id="opponent-area">Opponent HP: 100</div>
          <div id="battlefield">Battlefield</div>
          <div id="player-area">Player HP: 100</div>
          <div id="card-hand">Hand</div>
        </div>
      `;
    }
  }

  private unmountUI(): void {
    const container = document.getElementById('scene-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  private initializeAvatars(): void {
    // Get canvas element for avatar rendering
    const canvas = document.getElementById('avatar-canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.warn('Avatar canvas not found, skipping avatar initialization');
      return;
    }

    // Initialize avatar system through store
    const store = useGameStore.getState();
    store.initializeAvatarSystem(canvas).catch((error) => {
      console.error('Failed to initialize avatars in combat scene:', error);
    });

    // Load saved customizations
    store.loadCustomization('player');
    store.loadCustomization('ai');
  }

  private setupAvatarCombatIntegration(): void {
    if (!this.combatMachine) {
      console.warn('Combat machine not initialized, skipping avatar integration');
      return;
    }

    // Create avatar integration
    const store = useGameStore.getState();
    this.avatarIntegration = new AvatarCombatIntegration(
      {
        playAnimation: (avatarId: string, state: any) => {
          store.playAvatarAnimation(avatarId as 'player' | 'ai', state);
        },
      },
      'player',
      'ai'
    );

    // Subscribe to combat state machine
    this.avatarSubscription = setupAvatarIntegration(
      this.combatMachine,
      this.avatarIntegration
    );
  }

  private saveAvatarCustomizations(): void {
    const store = useGameStore.getState();
    store.saveCustomization('player');
    store.saveCustomization('ai');
  }

  private disposeAvatars(): void {
    const store = useGameStore.getState();
    store.disposeAvatarSystem();
  }
}
