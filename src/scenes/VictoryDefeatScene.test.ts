import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VictoryDefeatScene } from './VictoryDefeatScene';
import { WebAudioManager } from '../systems/WebAudioManager';
import { AnimationTimeline } from '../systems/AnimationTimeline';

describe('VictoryDefeatScene', () => {
  let scene: VictoryDefeatScene;
  let mockAudioManager: WebAudioManager;
  let mockAnimationTimeline: AnimationTimeline;

  beforeEach(() => {
    // Mock DOM
    document.body.innerHTML = '<div id="scene-container"></div>';

    // Mock audio manager
    mockAudioManager = {
      playMusic: vi.fn(),
      stopMusic: vi.fn(),
    } as any;

    // Mock animation timeline
    mockAnimationTimeline = {
      victory: vi.fn(),
      defeat: vi.fn(),
      killAll: vi.fn(),
    } as any;

    scene = new VictoryDefeatScene('victory', mockAudioManager, mockAnimationTimeline);
  });

  describe('Scene Lifecycle', () => {
    it('should have correct name', () => {
      expect(scene.name).toBe('victoryDefeat');
    });

    it('should load assets', async () => {
      await scene.load();
      // Load should complete without error
      expect(true).toBe(true);
    });

    it('should enter victory scene and play victory music', () => {
      scene.setType('victory');
      scene.enter();

      expect(mockAudioManager.playMusic).toHaveBeenCalledWith('victoryMusic', false);
    });

    it('should enter defeat scene and play defeat music', () => {
      scene.setType('defeat');
      scene.enter();

      expect(mockAudioManager.playMusic).toHaveBeenCalledWith('defeatMusic', false);
    });

    it('should play victory animation on enter', () => {
      scene.setType('victory');
      scene.enter();

      expect(mockAnimationTimeline.victory).toHaveBeenCalled();
    });

    it('should play defeat animation on enter', () => {
      scene.setType('defeat');
      scene.enter();

      expect(mockAnimationTimeline.defeat).toHaveBeenCalled();
    });

    it('should mount UI on enter', () => {
      scene.enter();

      const container = document.getElementById('scene-container');
      expect(container?.innerHTML).toContain('victory-defeat-scene');
      expect(container?.innerHTML).toContain('Play Again');
    });

    it('should display victory message', () => {
      scene.setType('victory');
      scene.enter();

      const container = document.getElementById('scene-container');
      expect(container?.innerHTML).toContain('Victory!');
      expect(container?.innerHTML).toContain('🎉');
    });

    it('should display defeat message', () => {
      scene.setType('defeat');
      scene.enter();

      const container = document.getElementById('scene-container');
      expect(container?.innerHTML).toContain('Defeat');
      expect(container?.innerHTML).toContain('💀');
    });

    it('should exit scene and stop music', () => {
      scene.enter();
      scene.exit();

      expect(mockAudioManager.stopMusic).toHaveBeenCalled();
    });

    it('should kill animations on exit', () => {
      scene.enter();
      scene.exit();

      expect(mockAnimationTimeline.killAll).toHaveBeenCalled();
    });

    it('should unmount UI on exit', () => {
      scene.enter();
      scene.exit();

      const container = document.getElementById('scene-container');
      expect(container?.innerHTML).toBe('');
    });

    it('should cleanup resources', () => {
      const callback = vi.fn();
      scene.setOnPlayAgain(callback);

      scene.cleanup();

      scene.triggerPlayAgain();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Type Management', () => {
    it('should get current type', () => {
      expect(scene.getType()).toBe('victory');
    });

    it('should set type', () => {
      scene.setType('defeat');
      expect(scene.getType()).toBe('defeat');
    });

    it('should initialize with constructor type', () => {
      const defeatScene = new VictoryDefeatScene('defeat');
      expect(defeatScene.getType()).toBe('defeat');
    });
  });

  describe('Play Again Button', () => {
    it('should set play again callback', () => {
      const callback = vi.fn();
      scene.setOnPlayAgain(callback);

      scene.triggerPlayAgain();

      expect(callback).toHaveBeenCalled();
    });

    it('should trigger play again callback when button clicked', () => {
      const callback = vi.fn();
      scene.setOnPlayAgain(callback);
      scene.enter();

      const playAgainButton = document.getElementById('play-again-button');
      playAgainButton?.click();

      expect(callback).toHaveBeenCalled();
    });

    it('should not crash if no callback set', () => {
      scene.enter();

      const playAgainButton = document.getElementById('play-again-button');
      playAgainButton?.click();

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Update Loop', () => {
    it('should handle update calls', () => {
      scene.update(16.67);
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Without Dependencies', () => {
    it('should work without audio manager', () => {
      const sceneNoAudio = new VictoryDefeatScene('victory', undefined, mockAnimationTimeline);

      sceneNoAudio.enter();
      sceneNoAudio.exit();

      // Should not throw
      expect(true).toBe(true);
    });

    it('should work without animation timeline', () => {
      const sceneNoAnim = new VictoryDefeatScene('victory', mockAudioManager, undefined);

      sceneNoAnim.enter();
      sceneNoAnim.exit();

      // Should not throw
      expect(true).toBe(true);
    });

    it('should work without any dependencies', () => {
      const sceneNoDeps = new VictoryDefeatScene('victory');

      sceneNoDeps.enter();
      sceneNoDeps.exit();

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing DOM container', () => {
      document.body.innerHTML = '';

      scene.enter();
      scene.exit();

      // Should not throw
      expect(true).toBe(true);
    });

    it('should handle multiple enter/exit cycles', () => {
      scene.enter();
      scene.exit();
      scene.enter();
      scene.exit();

      expect(mockAudioManager.playMusic).toHaveBeenCalledTimes(2);
      expect(mockAudioManager.stopMusic).toHaveBeenCalledTimes(2);
      expect(mockAnimationTimeline.killAll).toHaveBeenCalledTimes(2);
    });

    it('should handle type change between cycles', () => {
      scene.setType('victory');
      scene.enter();
      scene.exit();

      scene.setType('defeat');
      scene.enter();

      expect(mockAudioManager.playMusic).toHaveBeenCalledWith('defeatMusic', false);
      expect(mockAnimationTimeline.defeat).toHaveBeenCalled();
    });
  });
});
