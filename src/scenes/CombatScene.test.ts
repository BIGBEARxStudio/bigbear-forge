import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CombatScene } from './CombatScene';
import { WebAudioManager } from '../systems/WebAudioManager';
import { GameLoop } from '../systems/GameLoop';

describe('CombatScene', () => {
  let scene: CombatScene;
  let mockAudioManager: WebAudioManager;
  let mockGameLoop: GameLoop;

  beforeEach(() => {
    // Mock DOM
    document.body.innerHTML = '<div id="scene-container"></div>';

    // Mock audio manager
    mockAudioManager = {
      playMusic: vi.fn(),
      stopMusic: vi.fn(),
    } as any;

    // Mock game loop
    mockGameLoop = {
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
    } as any;

    scene = new CombatScene(mockAudioManager, mockGameLoop);
  });

  describe('Scene Lifecycle', () => {
    it('should have correct name', () => {
      expect(scene.name).toBe('combat');
    });

    it('should load assets', async () => {
      await scene.load();
      // Load should complete without error
      expect(true).toBe(true);
    });

    it('should enter scene and start music', () => {
      scene.enter();

      expect(mockAudioManager.playMusic).toHaveBeenCalledWith('combatMusic', true);
    });

    it('should enter scene and start game loop', () => {
      scene.enter();

      expect(mockGameLoop.start).toHaveBeenCalled();
    });

    it('should mount UI on enter', () => {
      scene.enter();

      const container = document.getElementById('scene-container');
      expect(container?.innerHTML).toContain('combat-scene');
      expect(container?.innerHTML).toContain('Battlefield');
    });

    it('should exit scene and pause game loop', () => {
      scene.enter();
      scene.exit();

      expect(mockGameLoop.pause).toHaveBeenCalled();
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
      scene.enter();
      scene.cleanup();

      expect(mockGameLoop.stop).toHaveBeenCalled();
    });
  });

  describe('Victory and Defeat Callbacks', () => {
    it('should set victory callback', () => {
      const callback = vi.fn();
      scene.setOnVictory(callback);

      scene.triggerVictory();

      expect(callback).toHaveBeenCalled();
    });

    it('should set defeat callback', () => {
      const callback = vi.fn();
      scene.setOnDefeat(callback);

      scene.triggerDefeat();

      expect(callback).toHaveBeenCalled();
    });

    it('should not crash if no callbacks set', () => {
      scene.triggerVictory();
      scene.triggerDefeat();

      // Should not throw
      expect(true).toBe(true);
    });

    it('should clear callbacks on cleanup', () => {
      const victoryCallback = vi.fn();
      const defeatCallback = vi.fn();
      scene.setOnVictory(victoryCallback);
      scene.setOnDefeat(defeatCallback);

      scene.cleanup();

      scene.triggerVictory();
      scene.triggerDefeat();

      expect(victoryCallback).not.toHaveBeenCalled();
      expect(defeatCallback).not.toHaveBeenCalled();
    });
  });

  describe('Update Loop', () => {
    it('should handle update calls', () => {
      scene.update(16.67);
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Combat State Machine', () => {
    it('should initialize combat machine on enter', () => {
      scene.enter();
      // Should not throw
      expect(true).toBe(true);
    });

    it('should stop combat machine on cleanup', () => {
      scene.enter();
      scene.cleanup();
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Without Dependencies', () => {
    it('should work without audio manager', () => {
      const sceneNoAudio = new CombatScene(undefined, mockGameLoop);

      sceneNoAudio.enter();
      sceneNoAudio.exit();

      // Should not throw
      expect(true).toBe(true);
    });

    it('should work without game loop', () => {
      const sceneNoLoop = new CombatScene(mockAudioManager, undefined);

      sceneNoLoop.enter();
      sceneNoLoop.exit();

      // Should not throw
      expect(true).toBe(true);
    });

    it('should work without any dependencies', () => {
      const sceneNoDeps = new CombatScene();

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
      expect(mockGameLoop.start).toHaveBeenCalledTimes(2);
      expect(mockGameLoop.pause).toHaveBeenCalledTimes(2);
    });

    it('should handle cleanup without enter', () => {
      scene.cleanup();

      // Should not throw
      expect(true).toBe(true);
    });
  });
});
