import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebAudioManager } from './WebAudioManager';

// Mock AudioContext
class MockAudioContext {
  state: AudioContextState = 'running';
  destination = {};
  
  createGain() {
    return {
      gain: { value: 1.0 },
      connect: vi.fn(),
    };
  }
  
  createBufferSource() {
    return {
      buffer: null,
      loop: false,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  
  async decodeAudioData(arrayBuffer: ArrayBuffer) {
    return {} as AudioBuffer;
  }
  
  async resume() {
    this.state = 'running';
  }
  
  async close() {
    this.state = 'closed';
  }
}

describe('WebAudioManager', () => {
  let audioManager: WebAudioManager;
  
  beforeEach(() => {
    // Mock AudioContext
    (global as any).AudioContext = MockAudioContext;
    (global as any).window = { AudioContext: MockAudioContext };
    
    audioManager = new WebAudioManager();
  });
  
  describe('Initialization', () => {
    it('should initialize audio context', async () => {
      await audioManager.initialize();
      
      expect(audioManager.isReady()).toBe(true);
    });
    
    it('should not reinitialize if already initialized', async () => {
      await audioManager.initialize();
      await audioManager.initialize();
      
      expect(audioManager.isReady()).toBe(true);
    });
    
    it('should have running context state after initialization', async () => {
      await audioManager.initialize();
      
      expect(audioManager.getContextState()).toBe('running');
    });
  });
  
  describe('Sound Loading', () => {
    beforeEach(async () => {
      await audioManager.initialize();
      
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        arrayBuffer: async () => new ArrayBuffer(8),
      });
    });
    
    it('should load sound', async () => {
      await audioManager.loadSound('test-sound', '/test.mp3');
      
      expect(global.fetch).toHaveBeenCalledWith('/test.mp3');
    });
    
    it('should load music', async () => {
      await audioManager.loadMusic('test-music', '/test-music.mp3');
      
      expect(global.fetch).toHaveBeenCalledWith('/test-music.mp3');
    });
    
    it('should throw error when loading sound without initialization', async () => {
      const uninitializedManager = new WebAudioManager();
      
      await expect(
        uninitializedManager.loadSound('test', '/test.mp3')
      ).rejects.toThrow('Audio context not initialized');
    });
    
    it('should load manifest', async () => {
      const manifest = {
        sounds: {
          'sound1': '/sound1.mp3',
          'sound2': '/sound2.mp3',
        },
        music: {
          'music1': '/music1.mp3',
        },
      };
      
      await audioManager.loadManifest(manifest);
      
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
  
  describe('Sound Playback', () => {
    beforeEach(async () => {
      await audioManager.initialize();
      
      global.fetch = vi.fn().mockResolvedValue({
        arrayBuffer: async () => new ArrayBuffer(8),
      });
      
      await audioManager.loadSound('test-sound', '/test.mp3');
    });
    
    it('should play sound', () => {
      expect(() => audioManager.playSound('test-sound')).not.toThrow();
    });
    
    it('should play sound with custom volume', () => {
      expect(() => audioManager.playSound('test-sound', 0.5)).not.toThrow();
    });
    
    it('should not crash when playing non-existent sound', () => {
      expect(() => audioManager.playSound('non-existent')).not.toThrow();
    });
    
    it('should not play sound when muted', () => {
      audioManager.mute();
      
      expect(() => audioManager.playSound('test-sound')).not.toThrow();
    });
  });
  
  describe('Music Playback', () => {
    beforeEach(async () => {
      await audioManager.initialize();
      
      global.fetch = vi.fn().mockResolvedValue({
        arrayBuffer: async () => new ArrayBuffer(8),
      });
      
      await audioManager.loadMusic('test-music', '/test-music.mp3');
    });
    
    it('should play music', () => {
      expect(() => audioManager.playMusic('test-music')).not.toThrow();
    });
    
    it('should play music without looping', () => {
      expect(() => audioManager.playMusic('test-music', false)).not.toThrow();
    });
    
    it('should stop music', () => {
      audioManager.playMusic('test-music');
      
      expect(() => audioManager.stopMusic()).not.toThrow();
    });
    
    it('should stop current music when playing new music', () => {
      audioManager.playMusic('test-music');
      audioManager.playMusic('test-music');
      
      expect(() => audioManager.stopMusic()).not.toThrow();
    });
    
    it('should not crash when playing non-existent music', () => {
      expect(() => audioManager.playMusic('non-existent')).not.toThrow();
    });
  });
  
  describe('Volume Control', () => {
    beforeEach(async () => {
      await audioManager.initialize();
    });
    
    it('should set master volume', () => {
      audioManager.setMasterVolume(0.5);
      
      expect(audioManager.getConfig().masterVolume).toBe(0.5);
    });
    
    it('should set sound volume', () => {
      audioManager.setSoundVolume(0.7);
      
      expect(audioManager.getConfig().soundVolume).toBe(0.7);
    });
    
    it('should set music volume', () => {
      audioManager.setMusicVolume(0.3);
      
      expect(audioManager.getConfig().musicVolume).toBe(0.3);
    });
    
    it('should clamp master volume to 0-1 range', () => {
      audioManager.setMasterVolume(1.5);
      expect(audioManager.getConfig().masterVolume).toBe(1.0);
      
      audioManager.setMasterVolume(-0.5);
      expect(audioManager.getConfig().masterVolume).toBe(0.0);
    });
    
    it('should clamp sound volume to 0-1 range', () => {
      audioManager.setSoundVolume(2.0);
      expect(audioManager.getConfig().soundVolume).toBe(1.0);
      
      audioManager.setSoundVolume(-1.0);
      expect(audioManager.getConfig().soundVolume).toBe(0.0);
    });
    
    it('should clamp music volume to 0-1 range', () => {
      audioManager.setMusicVolume(1.5);
      expect(audioManager.getConfig().musicVolume).toBe(1.0);
      
      audioManager.setMusicVolume(-0.5);
      expect(audioManager.getConfig().musicVolume).toBe(0.0);
    });
  });
  
  describe('Mute Control', () => {
    beforeEach(async () => {
      await audioManager.initialize();
    });
    
    it('should mute audio', () => {
      audioManager.mute();
      
      expect(audioManager.isMutedState()).toBe(true);
    });
    
    it('should unmute audio', () => {
      audioManager.mute();
      audioManager.unmute();
      
      expect(audioManager.isMutedState()).toBe(false);
    });
    
    it('should toggle mute state', () => {
      expect(audioManager.isMutedState()).toBe(false);
      
      audioManager.toggleMute();
      expect(audioManager.isMutedState()).toBe(true);
      
      audioManager.toggleMute();
      expect(audioManager.isMutedState()).toBe(false);
    });
  });
  
  describe('Context Management', () => {
    it('should resume suspended context', async () => {
      await audioManager.initialize();
      
      await audioManager.resumeContext();
      
      expect(audioManager.getContextState()).toBe('running');
    });
    
    it('should dispose of resources', async () => {
      await audioManager.initialize();
      
      audioManager.dispose();
      
      expect(audioManager.isReady()).toBe(false);
    });
  });
  
  describe('Configuration', () => {
    beforeEach(async () => {
      await audioManager.initialize();
    });
    
    it('should return current configuration', () => {
      const config = audioManager.getConfig();
      
      expect(config.masterVolume).toBeDefined();
      expect(config.soundVolume).toBeDefined();
      expect(config.musicVolume).toBeDefined();
    });
    
    it('should have default volumes', () => {
      const config = audioManager.getConfig();
      
      expect(config.masterVolume).toBe(1.0);
      expect(config.soundVolume).toBe(1.0);
      expect(config.musicVolume).toBe(0.7);
    });
    
    it('should not mutate returned config', () => {
      const config1 = audioManager.getConfig();
      config1.masterVolume = 0.5;
      
      const config2 = audioManager.getConfig();
      expect(config2.masterVolume).toBe(1.0);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle playSound before initialization', () => {
      expect(() => audioManager.playSound('test')).not.toThrow();
    });
    
    it('should handle playMusic before initialization', () => {
      expect(() => audioManager.playMusic('test')).not.toThrow();
    });
    
    it('should handle stopMusic when no music is playing', () => {
      expect(() => audioManager.stopMusic()).not.toThrow();
    });
    
    it('should handle setMasterVolume before initialization', () => {
      audioManager.setMasterVolume(0.5);
      
      expect(audioManager.getConfig().masterVolume).toBe(0.5);
    });
    
    it('should handle mute before initialization', () => {
      audioManager.mute();
      
      expect(audioManager.isMutedState()).toBe(true);
    });
    
    it('should handle dispose before initialization', () => {
      expect(() => audioManager.dispose()).not.toThrow();
    });
  });
});
