import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MainMenuScene } from './MainMenuScene';
import { WebAudioManager } from '../systems/WebAudioManager';

describe('MainMenuScene', () => {
  let scene: MainMenuScene;
  let mockAudioManager: WebAudioManager;

  beforeEach(() => {
    // Mock DOM
    document.body.innerHTML = '<div id="scene-container"></div>';

    // Mock audio manager
    mockAudioManager = {
      playMusic: vi.fn(),
      stopMusic: vi.fn(),
    } as any;

    scene = new MainMenuScene(mockAudioManager);
  });

  describe('Scene Lifecycle', () => {
    it('should have correct name', () => {
      expect(scene.name).toBe('mainMenu');
    });

    it('should load assets', async () => {
      await scene.load();
      // Load should complete without error
      expect(true).toBe(true);
    });

    it('should enter scene and start music', () => {
      scene.enter();

      expect(mockAudioManager.playMusic).toHaveBeenCalledWith('menuMusic', true);
    });

    it('should mount UI on enter', () => {
      scene.enter();

      const container = document.getElementById('scene-container');
      expect(container?.innerHTML).toContain('Card Battle');
      expect(container?.innerHTML).toContain('Play');
    });

    it('should exit scene and stop music', () => {
      scene.enter();
      scene.exit();

      expect(mockAudioManager.stopMusic).toHaveBeenCalled();
    });

    it('should unmount UI on exit', () => {
      scene.enter();
      scene.exit();

      const container = document.getElementById('scene-container');
      expect(container?.innerHTML).toBe('');
    });

    it('should cleanup resources', () => {
      const callback = vi.fn();
      scene.setOnPlay(callback);

      scene.cleanup();

      scene.triggerPlay();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Play Button', () => {
    it('should set play callback', () => {
      const callback = vi.fn();
      scene.setOnPlay(callback);

      scene.triggerPlay();

      expect(callback).toHaveBeenCalled();
    });

    it('should trigger play callback when button clicked', () => {
      const callback = vi.fn();
      scene.setOnPlay(callback);
      scene.enter();

      const playButton = document.getElementById('play-button');
      playButton?.click();

      expect(callback).toHaveBeenCalled();
    });

    it('should not crash if no callback set', () => {
      scene.enter();

      const playButton = document.getElementById('play-button');
      playButton?.click();

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

  describe('Without Audio Manager', () => {
    it('should work without audio manager', () => {
      const sceneNoAudio = new MainMenuScene();

      sceneNoAudio.enter();
      sceneNoAudio.exit();

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
    });
  });
});
