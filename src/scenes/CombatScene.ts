import { Scene } from '../systems/SceneManager';
import { WebAudioManager } from '../systems/WebAudioManager';
import { GameLoop } from '../systems/GameLoop';
import { createMachine, interpret, InterpreterFrom } from 'xstate';
import { CombatContext, CombatEvent } from '../systems/CombatStateMachine';

/**
 * CombatScene - Main gameplay scene
 * Manages combat state machine, game loop, and battle UI
 */
export class CombatScene implements Scene {
  name = 'combat';
  private audioManager: WebAudioManager | null = null;
  private gameLoop: GameLoop | null = null;
  private combatMachine: InterpreterFrom<any> | null = null;
  private onVictoryCallback: (() => void) | null = null;
  private onDefeatCallback: (() => void) | null = null;

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
    // Initialize combat state machine
    this.initializeCombatMachine();

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

  update(deltaTime: number): void {
    // Update combat state machine
    // In real implementation, this would update based on game state
  }

  cleanup(): void {
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
    const machine = createMachine<CombatContext, CombatEvent>({
      id: 'combat',
      initial: 'IDLE',
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
}
