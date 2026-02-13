/**
 * SpriteFallback - 2D sprite rendering system for devices without WebGL
 * Provides fallback rendering using canvas 2D context
 */

import { AnimationState, CustomizationData } from '../types';

export interface SpriteSheet {
  image: HTMLImageElement | null;
  frameWidth: number;
  frameHeight: number;
  animations: Map<AnimationState, SpriteAnimation>;
}

export interface SpriteAnimation {
  frames: number[];
  frameDuration: number;
  loop: boolean;
}

export interface SpriteFallback {
  initialize(canvas: HTMLCanvasElement): Promise<void>;
  renderAvatar(avatarId: string, state: AnimationState, position: { x: number; y: number }): void;
  updateCustomization(avatarId: string, customization: CustomizationData): void;
  dispose(): void;
}

export class SpriteFallbackImpl implements SpriteFallback {
  private ctx: CanvasRenderingContext2D | null = null;
  private spriteSheets: Map<string, SpriteSheet> = new Map();
  private currentFrames: Map<string, number> = new Map();
  private frameTimers: Map<string, number> = new Map();
  private currentStates: Map<string, AnimationState> = new Map();
  private customizations: Map<string, CustomizationData> = new Map();
  private useFallbackRectangles: boolean = false;

  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    if (!canvas) {
      throw new Error('Canvas element is required');
    }

    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Failed to get 2D context');
    }

    // Try to load sprite sheets, fall back to rectangles if loading fails
    try {
      await this.loadSpriteSheets();
    } catch (error) {
      console.warn('Failed to load sprite sheets, using colored rectangles:', error);
      this.useFallbackRectangles = true;
      this.initializeFallbackSprites();
    }
  }

  private async loadSpriteSheets(): Promise<void> {
    // In a real implementation, these would load actual sprite sheet images
    // For now, we'll use the fallback rectangle system
    this.useFallbackRectangles = true;
    this.initializeFallbackSprites();
  }

  private initializeFallbackSprites(): void {
    // Create fallback sprite sheets for player and AI
    const createFallbackSheet = (): SpriteSheet => ({
      image: null,
      frameWidth: 64,
      frameHeight: 64,
      animations: new Map([
        ['idle', { frames: [0, 1, 2, 3], frameDuration: 200, loop: true }],
        ['attack', { frames: [4, 5, 6], frameDuration: 100, loop: false }],
        ['defend', { frames: [7, 8], frameDuration: 150, loop: false }],
        ['damaged', { frames: [9, 10, 9], frameDuration: 100, loop: false }],
        ['victory', { frames: [11, 12, 13], frameDuration: 200, loop: false }],
        ['defeat', { frames: [14, 15], frameDuration: 300, loop: false }]
      ])
    });

    this.spriteSheets.set('player', createFallbackSheet());
    this.spriteSheets.set('ai', createFallbackSheet());
  }

  renderAvatar(
    avatarId: string,
    state: AnimationState,
    position: { x: number; y: number }
  ): void {
    if (!this.ctx) {
      return;
    }

    // Update state if changed
    const previousState = this.currentStates.get(avatarId);
    if (previousState !== state) {
      this.currentStates.set(avatarId, state);
      this.currentFrames.set(avatarId, 0);
      this.frameTimers.set(avatarId, Date.now());
    }

    const spriteSheet = this.spriteSheets.get(avatarId);
    if (!spriteSheet) {
      return;
    }

    const animation = spriteSheet.animations.get(state);
    if (!animation) {
      return;
    }

    // Update frame based on time
    this.updateFrame(avatarId, animation);

    // Render based on mode
    if (this.useFallbackRectangles || !spriteSheet.image) {
      this.renderFallbackRectangle(avatarId, state, position, spriteSheet);
    } else {
      this.renderSprite(avatarId, animation, position, spriteSheet);
    }
  }

  private updateFrame(avatarId: string, animation: SpriteAnimation): void {
    const now = Date.now();
    const lastFrameTime = this.frameTimers.get(avatarId) || 0;
    
    if (now - lastFrameTime > animation.frameDuration) {
      const currentFrame = this.currentFrames.get(avatarId) || 0;
      let nextFrame: number;

      if (animation.loop) {
        nextFrame = (currentFrame + 1) % animation.frames.length;
      } else {
        nextFrame = Math.min(currentFrame + 1, animation.frames.length - 1);
      }

      this.currentFrames.set(avatarId, nextFrame);
      this.frameTimers.set(avatarId, now);
    }
  }

  private renderSprite(
    avatarId: string,
    animation: SpriteAnimation,
    position: { x: number; y: number },
    spriteSheet: SpriteSheet
  ): void {
    if (!this.ctx || !spriteSheet.image) return;

    const frameIndex = this.currentFrames.get(avatarId) || 0;
    const spriteIndex = animation.frames[frameIndex];
    const sx = (spriteIndex % 4) * spriteSheet.frameWidth;
    const sy = Math.floor(spriteIndex / 4) * spriteSheet.frameHeight;

    this.ctx.drawImage(
      spriteSheet.image,
      sx, sy,
      spriteSheet.frameWidth, spriteSheet.frameHeight,
      position.x, position.y,
      spriteSheet.frameWidth, spriteSheet.frameHeight
    );
  }

  private renderFallbackRectangle(
    avatarId: string,
    state: AnimationState,
    position: { x: number; y: number },
    spriteSheet: SpriteSheet
  ): void {
    if (!this.ctx) return;

    const customization = this.customizations.get(avatarId);
    const baseColor = customization?.colors.skin || (avatarId === 'player' ? '#4169e1' : '#dc143c');
    
    // Animate by pulsing the opacity based on frame
    const frameIndex = this.currentFrames.get(avatarId) || 0;
    const pulseAmount = Math.sin(frameIndex * 0.5) * 0.2 + 0.8;

    this.ctx.save();
    this.ctx.globalAlpha = pulseAmount;

    // Draw body
    this.ctx.fillStyle = baseColor;
    this.ctx.fillRect(
      position.x,
      position.y,
      spriteSheet.frameWidth,
      spriteSheet.frameHeight
    );

    // Draw state indicator
    this.ctx.fillStyle = this.getStateColor(state);
    this.ctx.fillRect(
      position.x + 5,
      position.y + 5,
      10,
      10
    );

    this.ctx.restore();
  }

  private getStateColor(state: AnimationState): string {
    switch (state) {
      case 'idle': return '#ffffff';
      case 'attack': return '#ff0000';
      case 'defend': return '#0000ff';
      case 'damaged': return '#ffff00';
      case 'victory': return '#00ff00';
      case 'defeat': return '#808080';
      default: return '#ffffff';
    }
  }

  updateCustomization(avatarId: string, customization: CustomizationData): void {
    this.customizations.set(avatarId, customization);
  }

  dispose(): void {
    this.ctx = null;
    this.spriteSheets.clear();
    this.currentFrames.clear();
    this.frameTimers.clear();
    this.currentStates.clear();
    this.customizations.clear();
  }

  // Utility methods for testing
  getCurrentFrame(avatarId: string): number {
    return this.currentFrames.get(avatarId) || 0;
  }

  getCurrentState(avatarId: string): AnimationState | undefined {
    return this.currentStates.get(avatarId);
  }

  isUsingFallbackRectangles(): boolean {
    return this.useFallbackRectangles;
  }
}
