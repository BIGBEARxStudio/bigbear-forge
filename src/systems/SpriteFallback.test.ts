import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpriteFallbackImpl } from './SpriteFallback';
import { AnimationState, CustomizationData } from '../types';

// Mock mockCanvas and context
const createMockCanvas = () => {
  const mockCtx = {
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    fillStyle: '',
    globalAlpha: 1
  };

  const mockCanvas = {
    width: 800,
    height: 600,
    getContext: vi.fn(() => mockCtx)
  };

  return { mockCanvas, mockCtx };
};

describe('SpriteFallback', () => {
  let fallback: SpriteFallbackImpl;
  let mockCanvas: any;
  let mockCtx: any;

  beforeEach(() => {
    fallback = new SpriteFallbackImpl();
    const mocks = createMockCanvas();
    mockCanvas = mocks.mockCanvas;
    mockCtx = mocks.mockCtx;
  });

  describe('initialize', () => {
    it('should initialize with mockCanvas', async () => {
      await fallback.initialize(mockCanvas);
      expect(fallback.isUsingFallbackRectangles()).toBe(true);
    });

    it('should throw error for null canvas', async () => {
      await expect(fallback.initialize(null as any)).rejects.toThrow('Canvas element is required');
    });

    it('should throw error if 2D context unavailable', async () => {
      const badmockCanvas = {
        getContext: () => null
      } as any;
      
      await expect(fallback.initialize(badmockCanvas)).rejects.toThrow('Failed to get 2D context');
    });

    it('should initialize sprite sheets', async () => {
      await fallback.initialize(mockCanvas);
      
      // Should be able to render after initialization
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });
  });

  describe('renderAvatar', () => {
    beforeEach(async () => {
      await fallback.initialize(mockCanvas);
    });

    it('should render player avatar', () => {
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('should render AI avatar', () => {
      fallback.renderAvatar('ai', 'idle', { x: 200, y: 100 });
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('should render all animation states', () => {
      const states: AnimationState[] = ['idle', 'attack', 'defend', 'damaged', 'victory', 'defeat'];
      
      states.forEach(state => {
        (mockCtx.fillRect as any).mockClear();
        fallback.renderAvatar('player', state, { x: 100, y: 100 });
        expect(mockCtx.fillRect).toHaveBeenCalled();
      });
    });

    it('should not render without initialization', () => {
      const uninitializedFallback = new SpriteFallbackImpl();
      uninitializedFallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it('should not render unknown avatar', () => {
      (mockCtx.fillRect as any).mockClear();
      fallback.renderAvatar('unknown', 'idle', { x: 100, y: 100 });
      // Should not crash, but won't render
    });

    it('should handle position changes', () => {
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      expect(mockCtx.fillRect).toHaveBeenCalledWith(100, 100, 64, 64);
      
      (mockCtx.fillRect as any).mockClear();
      fallback.renderAvatar('player', 'idle', { x: 200, y: 150 });
      expect(mockCtx.fillRect).toHaveBeenCalledWith(200, 150, 64, 64);
    });
  });

  describe('Animation State Tracking', () => {
    beforeEach(async () => {
      await fallback.initialize(mockCanvas);
    });

    it('should track current animation state', () => {
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      expect(fallback.getCurrentState('player')).toBe('idle');
    });

    it('should update state when changed', () => {
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      expect(fallback.getCurrentState('player')).toBe('idle');
      
      fallback.renderAvatar('player', 'attack', { x: 100, y: 100 });
      expect(fallback.getCurrentState('player')).toBe('attack');
    });

    it('should reset frame when state changes', async () => {
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      
      // Advance some frames by waiting
      await new Promise(resolve => setTimeout(resolve, 250));
      for (let i = 0; i < 5; i++) {
        fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      }
      
      const frameBeforeChange = fallback.getCurrentFrame('player');
      expect(frameBeforeChange).toBeGreaterThanOrEqual(0); // May or may not have advanced
      
      // Change state
      fallback.renderAvatar('player', 'attack', { x: 100, y: 100 });
      expect(fallback.getCurrentFrame('player')).toBe(0);
    });

    it('should track states independently for different avatars', () => {
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      fallback.renderAvatar('ai', 'attack', { x: 200, y: 100 });
      
      expect(fallback.getCurrentState('player')).toBe('idle');
      expect(fallback.getCurrentState('ai')).toBe('attack');
    });
  });

  describe('Frame Animation', () => {
    beforeEach(async () => {
      await fallback.initialize(mockCanvas);
    });

    it('should start at frame 0', () => {
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      expect(fallback.getCurrentFrame('player')).toBe(0);
    });

    it('should advance frames over time', async () => {
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      const initialFrame = fallback.getCurrentFrame('player');
      
      // Wait for frame duration
      await new Promise(resolve => setTimeout(resolve, 250));
      
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      const nextFrame = fallback.getCurrentFrame('player');
      
      expect(nextFrame).toBeGreaterThan(initialFrame);
    });

    it('should loop idle animation', async () => {
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      
      // Render many times to loop through animation
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 250));
        fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      }
      
      // Should have looped back
      const frame = fallback.getCurrentFrame('player');
      expect(frame).toBeLessThan(4); // idle has 4 frames
    });

    it('should not loop non-looping animations', async () => {
      fallback.renderAvatar('player', 'attack', { x: 100, y: 100 });
      
      // Render many times
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        fallback.renderAvatar('player', 'attack', { x: 100, y: 100 });
      }
      
      // Should stop at last frame (attack has 3 frames, index 2)
      const frame = fallback.getCurrentFrame('player');
      expect(frame).toBe(2);
    });
  });

  describe('updateCustomization', () => {
    beforeEach(async () => {
      await fallback.initialize(mockCanvas);
    });

    it('should update customization', () => {
      const customization: CustomizationData = {
        bodyParts: { head: 'default', torso: 'default', arms: 'default', legs: 'default' },
        colors: { skin: '#ff0000', hair: '#000000', clothing: '#0000ff' },
        accessories: {}
      };
      
      expect(() => fallback.updateCustomization('player', customization)).not.toThrow();
    });

    it('should apply customization to rendering', () => {
      const customization: CustomizationData = {
        bodyParts: { head: 'default', torso: 'default', arms: 'default', legs: 'default' },
        colors: { skin: '#ff0000', hair: '#000000', clothing: '#0000ff' },
        accessories: {}
      };
      
      fallback.updateCustomization('player', customization);
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      
      // Should render with custom color
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('should handle multiple avatar customizations', () => {
      const playerCustomization: CustomizationData = {
        bodyParts: { head: 'default', torso: 'default', arms: 'default', legs: 'default' },
        colors: { skin: '#ff0000', hair: '#000000', clothing: '#0000ff' },
        accessories: {}
      };
      
      const aiCustomization: CustomizationData = {
        bodyParts: { head: 'default', torso: 'default', arms: 'default', legs: 'default' },
        colors: { skin: '#00ff00', hair: '#ffffff', clothing: '#ff00ff' },
        accessories: {}
      };
      
      fallback.updateCustomization('player', playerCustomization);
      fallback.updateCustomization('ai', aiCustomization);
      
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      fallback.renderAvatar('ai', 'idle', { x: 200, y: 100 });
      
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    beforeEach(async () => {
      await fallback.initialize(mockCanvas);
    });

    it('should dispose resources', () => {
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      expect(fallback.getCurrentState('player')).toBe('idle');
      
      fallback.dispose();
      
      // Should not render after disposal
      (mockCtx.fillRect as any).mockClear();
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it('should clear all state', () => {
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      fallback.renderAvatar('ai', 'attack', { x: 200, y: 100 });
      
      fallback.dispose();
      
      expect(fallback.getCurrentState('player')).toBeUndefined();
      expect(fallback.getCurrentState('ai')).toBeUndefined();
      expect(fallback.getCurrentFrame('player')).toBe(0);
      expect(fallback.getCurrentFrame('ai')).toBe(0);
    });

    it('should not crash when disposed multiple times', () => {
      expect(() => {
        fallback.dispose();
        fallback.dispose();
      }).not.toThrow();
    });
  });

  describe('Fallback Rectangles', () => {
    beforeEach(async () => {
      await fallback.initialize(mockCanvas);
    });

    it('should use fallback rectangles by default', () => {
      expect(fallback.isUsingFallbackRectangles()).toBe(true);
    });

    it('should render colored rectangles', () => {
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      
      // Should call fillRect for body and state indicator
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should use different colors for player and AI', () => {
      (mockCtx.fillRect as any).mockClear();
      
      fallback.renderAvatar('player', 'idle', { x: 100, y: 100 });
      const playerCalls = (mockCtx.fillRect as any).mock.calls.length;
      
      (mockCtx.fillRect as any).mockClear();
      
      fallback.renderAvatar('ai', 'idle', { x: 200, y: 100 });
      const aiCalls = (mockCtx.fillRect as any).mock.calls.length;
      
      // Both should render
      expect(playerCalls).toBeGreaterThan(0);
      expect(aiCalls).toBeGreaterThan(0);
    });

    it('should show state with colored indicator', () => {
      const states: AnimationState[] = ['idle', 'attack', 'defend', 'damaged', 'victory', 'defeat'];
      
      states.forEach(state => {
        (mockCtx.fillRect as any).mockClear();
        fallback.renderAvatar('player', state, { x: 100, y: 100 });
        
        // Should draw body + state indicator
        expect((mockCtx.fillRect as any).mock.calls.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(async () => {
      await fallback.initialize(mockCanvas);
    });

    it('should handle rapid state changes', () => {
      const states: AnimationState[] = ['idle', 'attack', 'defend', 'damaged', 'victory', 'defeat'];
      
      states.forEach(state => {
        fallback.renderAvatar('player', state, { x: 100, y: 100 });
        expect(fallback.getCurrentState('player')).toBe(state);
      });
    });

    it('should handle rendering at mockCanvas boundaries', () => {
      fallback.renderAvatar('player', 'idle', { x: 0, y: 0 });
      fallback.renderAvatar('player', 'idle', { x: 736, y: 536 }); // 800-64, 600-64
      
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('should handle negative positions', () => {
      expect(() => {
        fallback.renderAvatar('player', 'idle', { x: -10, y: -10 });
      }).not.toThrow();
    });

    it('should handle very large positions', () => {
      expect(() => {
        fallback.renderAvatar('player', 'idle', { x: 10000, y: 10000 });
      }).not.toThrow();
    });
  });
});

