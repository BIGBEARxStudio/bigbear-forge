import gsap from 'gsap';

/**
 * Scene lifecycle interface
 * All scenes must implement these methods for proper resource management
 */
export interface Scene {
  name: string;
  load(): Promise<void>;
  enter(): void;
  exit(): void;
  update(deltaTime: number): void;
  cleanup(): void;
}

export type TransitionType = 'fade' | 'wipe' | 'none';

export interface SceneTransitionConfig {
  type: TransitionType;
  duration: number;
  containerSelector: string;
}

/**
 * SceneManager handles scene registration, transitions, and lifecycle management
 * Ensures proper resource cleanup and smooth transitions between game screens
 */
export class SceneManager {
  private scenes: Map<string, Scene> = new Map();
  private currentScene: Scene | null = null;
  private isTransitioning: boolean = false;
  private transitionConfig: SceneTransitionConfig = {
    type: 'fade',
    duration: 0.3,
    containerSelector: '#scene-container',
  };

  /**
   * Register a scene for later use
   */
  registerScene(scene: Scene): void {
    this.scenes.set(scene.name, scene);
  }

  /**
   * Unregister a scene
   */
  unregisterScene(sceneName: string): void {
    const scene = this.scenes.get(sceneName);
    if (scene && scene === this.currentScene) {
      throw new Error(`Cannot unregister active scene: ${sceneName}`);
    }
    this.scenes.delete(sceneName);
  }

  /**
   * Get the currently active scene
   */
  getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  /**
   * Check if a scene transition is in progress
   */
  isTransitionInProgress(): boolean {
    return this.isTransitioning;
  }

  /**
   * Configure transition settings
   */
  setTransitionConfig(config: Partial<SceneTransitionConfig>): void {
    this.transitionConfig = { ...this.transitionConfig, ...config };
  }

  /**
   * Transition to a new scene with optional transition animation
   * Handles full lifecycle: exit → cleanup → load → enter
   */
  async transitionTo(
    sceneName: string,
    transitionType?: TransitionType
  ): Promise<void> {
    if (this.isTransitioning) {
      throw new Error('Scene transition already in progress');
    }

    const nextScene = this.scenes.get(sceneName);
    if (!nextScene) {
      throw new Error(`Scene not found: ${sceneName}`);
    }

    if (this.currentScene?.name === sceneName) {
      return; // Already in this scene
    }

    this.isTransitioning = true;

    try {
      const transition = transitionType || this.transitionConfig.type;

      // Exit current scene
      if (this.currentScene) {
        this.currentScene.exit();
      }

      // Play transition out animation
      await this.playTransitionOut(transition);

      // Cleanup old scene
      if (this.currentScene) {
        this.currentScene.cleanup();
      }

      // Load new scene
      await nextScene.load();

      // Set as current scene
      this.currentScene = nextScene;

      // Enter new scene
      this.currentScene.enter();

      // Play transition in animation
      await this.playTransitionIn(transition);
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Update the current scene (called from game loop)
   */
  update(deltaTime: number): void {
    if (this.currentScene && !this.isTransitioning) {
      this.currentScene.update(deltaTime);
    }
  }

  /**
   * Cleanup all scenes and resources
   */
  dispose(): void {
    if (this.currentScene) {
      this.currentScene.exit();
      this.currentScene.cleanup();
      this.currentScene = null;
    }

    this.scenes.clear();
    this.isTransitioning = false;
  }

  /**
   * Play transition out animation
   */
  private async playTransitionOut(type: TransitionType): Promise<void> {
    const container = document.querySelector(
      this.transitionConfig.containerSelector
    );
    if (!container) return;

    switch (type) {
      case 'fade':
        await gsap.to(container, {
          opacity: 0,
          duration: this.transitionConfig.duration,
          ease: 'power2.inOut',
        });
        break;

      case 'wipe':
        await gsap.to(container, {
          x: '-100%',
          duration: this.transitionConfig.duration,
          ease: 'power2.inOut',
        });
        break;

      case 'none':
        // No animation
        break;
    }
  }

  /**
   * Play transition in animation
   */
  private async playTransitionIn(type: TransitionType): Promise<void> {
    const container = document.querySelector(
      this.transitionConfig.containerSelector
    );
    if (!container) return;

    switch (type) {
      case 'fade':
        gsap.set(container, { opacity: 0 });
        await gsap.to(container, {
          opacity: 1,
          duration: this.transitionConfig.duration,
          ease: 'power2.inOut',
        });
        break;

      case 'wipe':
        gsap.set(container, { x: '100%' });
        await gsap.to(container, {
          x: '0%',
          duration: this.transitionConfig.duration,
          ease: 'power2.inOut',
        });
        break;

      case 'none':
        // No animation
        break;
    }
  }
}
