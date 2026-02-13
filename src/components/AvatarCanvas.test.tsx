import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AvatarCanvas } from './AvatarCanvas';
import { useGameStore } from '@/stores/gameStore';

describe('AvatarCanvas', () => {
  beforeEach(() => {
    // Reset store state
    useGameStore.setState({
      system: {
        isWebGLAvailable: true,
        useFallback: false,
        performanceMode: 'high',
      },
      avatarSystem: null,
      cameraController: null,
    });
  });

  describe('Rendering', () => {
    it('should render canvas element', () => {
      render(<AvatarCanvas />);
      
      const canvas = screen.getByTestId('avatar-canvas');
      expect(canvas).toBeDefined();
      expect(canvas.tagName).toBe('CANVAS');
    });

    it('should render container with correct structure', () => {
      render(<AvatarCanvas />);
      
      const container = screen.getByTestId('avatar-canvas-container');
      expect(container).toBeDefined();
    });

    it('should apply custom className', () => {
      render(<AvatarCanvas className="custom-class" />);
      
      const container = screen.getByTestId('avatar-canvas-container');
      expect(container.className).toContain('custom-class');
    });

    it('should apply custom style', () => {
      render(<AvatarCanvas style={{ backgroundColor: 'red' }} />);
      
      const container = screen.getByTestId('avatar-canvas-container');
      expect(container.style.backgroundColor).toBe('red');
    });
  });

  describe('Initialization', () => {
    it('should call initializeAvatarSystem on mount', async () => {
      const initSpy = vi.spyOn(useGameStore.getState(), 'initializeAvatarSystem');
      
      render(<AvatarCanvas />);
      
      await waitFor(() => {
        expect(initSpy).toHaveBeenCalled();
      });
    });

    it('should pass canvas element to initializeAvatarSystem', async () => {
      const initSpy = vi.spyOn(useGameStore.getState(), 'initializeAvatarSystem');
      
      render(<AvatarCanvas />);
      
      await waitFor(() => {
        expect(initSpy).toHaveBeenCalledWith(expect.any(HTMLCanvasElement));
      });
    });

    it('should handle initialization errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(useGameStore.getState(), 'initializeAvatarSystem').mockRejectedValue(
        new Error('Init failed')
      );
      
      render(<AvatarCanvas />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to initialize avatar system:',
          expect.any(Error)
        );
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should call disposeAvatarSystem on unmount', () => {
      const disposeSpy = vi.spyOn(useGameStore.getState(), 'disposeAvatarSystem');
      
      const { unmount } = render(<AvatarCanvas />);
      unmount();
      
      expect(disposeSpy).toHaveBeenCalled();
    });

    it('should not throw on unmount if system not initialized', () => {
      const { unmount } = render(<AvatarCanvas />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Fallback Mode', () => {
    it('should show fallback indicator when useFallback is true', () => {
      useGameStore.setState({
        system: {
          isWebGLAvailable: false,
          useFallback: true,
          performanceMode: 'high',
        },
      });
      
      render(<AvatarCanvas />);
      
      const fallbackIndicator = screen.getByTestId('fallback-indicator');
      expect(fallbackIndicator).toBeDefined();
      expect(fallbackIndicator.textContent).toContain('WebGL unavailable');
    });

    it('should not show fallback indicator when WebGL is available', () => {
      useGameStore.setState({
        system: {
          isWebGLAvailable: true,
          useFallback: false,
          performanceMode: 'high',
        },
      });
      
      render(<AvatarCanvas />);
      
      const fallbackIndicator = screen.queryByTestId('fallback-indicator');
      expect(fallbackIndicator).toBeNull();
    });

    it('should show WebGL unavailable message when not available and no fallback', () => {
      useGameStore.setState({
        system: {
          isWebGLAvailable: false,
          useFallback: false,
          performanceMode: 'high',
        },
      });
      
      render(<AvatarCanvas />);
      
      const unavailableMessage = screen.getByTestId('webgl-unavailable');
      expect(unavailableMessage).toBeDefined();
      expect(unavailableMessage.textContent).toContain('WebGL not available');
    });
  });

  describe('Canvas Properties', () => {
    it('should have correct canvas dimensions', () => {
      render(<AvatarCanvas />);
      
      const canvas = screen.getByTestId('avatar-canvas') as HTMLCanvasElement;
      expect(canvas.style.width).toBe('100%');
      expect(canvas.style.height).toBe('100%');
    });

    it('should have display block style', () => {
      render(<AvatarCanvas />);
      
      const canvas = screen.getByTestId('avatar-canvas') as HTMLCanvasElement;
      expect(canvas.style.display).toBe('block');
    });
  });

  describe('Container Properties', () => {
    it('should have relative positioning', () => {
      render(<AvatarCanvas />);
      
      const container = screen.getByTestId('avatar-canvas-container');
      expect(container.style.position).toBe('relative');
    });

    it('should have full width and height', () => {
      render(<AvatarCanvas />);
      
      const container = screen.getByTestId('avatar-canvas-container');
      expect(container.style.width).toBe('100%');
      expect(container.style.height).toBe('100%');
    });
  });
});
