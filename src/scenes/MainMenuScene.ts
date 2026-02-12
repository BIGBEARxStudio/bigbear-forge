import { Scene } from '../systems/SceneManager';
import { WebAudioManager } from '../systems/WebAudioManager';

/**
 * MainMenuScene - Entry point for the game
 * Displays title, play button, and settings
 */
export class MainMenuScene implements Scene {
  name = 'mainMenu';
  private audioManager: WebAudioManager | null = null;
  private onPlayCallback: (() => void) | null = null;

  constructor(audioManager?: WebAudioManager) {
    this.audioManager = audioManager || null;
  }

  /**
   * Set callback for when play button is clicked
   */
  setOnPlay(callback: () => void): void {
    this.onPlayCallback = callback;
  }

  /**
   * Trigger play action (for testing or programmatic use)
   */
  triggerPlay(): void {
    if (this.onPlayCallback) {
      this.onPlayCallback();
    }
  }

  async load(): Promise<void> {
    // Lazy load menu assets
    // In a real implementation, this would load React components
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  enter(): void {
    // Start menu music
    if (this.audioManager) {
      this.audioManager.playMusic('menuMusic', true);
    }

    // Mount React component (would be done via React in real implementation)
    this.mountUI();
  }

  exit(): void {
    // Stop menu music
    if (this.audioManager) {
      this.audioManager.stopMusic();
    }

    // Unmount React component
    this.unmountUI();
  }

  update(deltaTime: number): void {
    // No game loop updates needed for menu
    // Menu is purely UI-driven
  }

  cleanup(): void {
    // Release resources
    this.onPlayCallback = null;
  }

  private mountUI(): void {
    // In real implementation, this would mount React component
    // For now, just create a simple DOM structure for testing
    const container = document.getElementById('scene-container');
    if (container) {
      container.innerHTML = `
        <div id="main-menu">
          <h1>Card Battle</h1>
          <button id="play-button">Play</button>
          <button id="settings-button">Settings</button>
        </div>
      `;

      const playButton = document.getElementById('play-button');
      if (playButton) {
        playButton.addEventListener('click', () => this.triggerPlay());
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
