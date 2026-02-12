import { Scene } from '../systems/SceneManager';
import { WebAudioManager } from '../systems/WebAudioManager';
import { AnimationTimeline } from '../systems/AnimationTimeline';

export type VictoryDefeatType = 'victory' | 'defeat';

/**
 * VictoryDefeatScene - End game screen
 * Displays victory or defeat message with play again option
 */
export class VictoryDefeatScene implements Scene {
  name = 'victoryDefeat';
  private type: VictoryDefeatType;
  private audioManager: WebAudioManager | null = null;
  private animationTimeline: AnimationTimeline | null = null;
  private onPlayAgainCallback: (() => void) | null = null;

  constructor(
    type: VictoryDefeatType,
    audioManager?: WebAudioManager,
    animationTimeline?: AnimationTimeline
  ) {
    this.type = type;
    this.audioManager = audioManager || null;
    this.animationTimeline = animationTimeline || null;
  }

  /**
   * Set the victory/defeat type
   */
  setType(type: VictoryDefeatType): void {
    this.type = type;
  }

  /**
   * Get the current type
   */
  getType(): VictoryDefeatType {
    return this.type;
  }

  /**
   * Set callback for play again button
   */
  setOnPlayAgain(callback: () => void): void {
    this.onPlayAgainCallback = callback;
  }

  /**
   * Trigger play again action (for testing or programmatic use)
   */
  triggerPlayAgain(): void {
    if (this.onPlayAgainCallback) {
      this.onPlayAgainCallback();
    }
  }

  async load(): Promise<void> {
    // Lazy load victory/defeat assets
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  enter(): void {
    // Play appropriate music
    if (this.audioManager) {
      if (this.type === 'victory') {
        this.audioManager.playMusic('victoryMusic', false);
      } else {
        this.audioManager.playMusic('defeatMusic', false);
      }
    }

    // Play appropriate animation
    if (this.animationTimeline) {
      if (this.type === 'victory') {
        this.animationTimeline.victory();
      } else {
        this.animationTimeline.defeat();
      }
    }

    // Mount UI
    this.mountUI();
  }

  exit(): void {
    // Stop music
    if (this.audioManager) {
      this.audioManager.stopMusic();
    }

    // Kill animations
    if (this.animationTimeline) {
      this.animationTimeline.killAll();
    }

    // Unmount UI
    this.unmountUI();
  }

  update(deltaTime: number): void {
    // No game loop updates needed
  }

  cleanup(): void {
    // Release resources
    this.onPlayAgainCallback = null;
  }

  private mountUI(): void {
    const container = document.getElementById('scene-container');
    if (container) {
      const message = this.type === 'victory' ? 'Victory!' : 'Defeat';
      const emoji = this.type === 'victory' ? '🎉' : '💀';

      container.innerHTML = `
        <div id="victory-defeat-scene">
          <h1>${emoji} ${message} ${emoji}</h1>
          <button id="play-again-button">Play Again</button>
          <button id="main-menu-button">Main Menu</button>
        </div>
      `;

      const playAgainButton = document.getElementById('play-again-button');
      if (playAgainButton) {
        playAgainButton.addEventListener('click', () => this.triggerPlayAgain());
      }
    }
  }

  private unmountUI(): void {
    const container = document.getElementById('scene-container');
    if (container) {
      container.innerHTML = '';
    }
  }
}
