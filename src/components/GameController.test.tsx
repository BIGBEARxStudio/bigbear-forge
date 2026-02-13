import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GameController } from './GameController';
import { useGameStore } from '@/stores/gameStore';
import { SceneManager } from '@/systems/SceneManager';

// Mock systems
vi.mock('@/systems/SceneManager');
vi.mock('@/systems/AssetLoader');

describe('GameController', () => {
  let mockSceneManager: any;

  beforeEach(() => {
    // Reset store
    useGameStore.setState({
      ui: {
        currentScene: 'mainMenu',
        isTransitioning: false,
        showPauseMenu: false,
      },
      gameLoop: {
        isRunning: false,
        isPaused: false,
        fps: 0,
        frameTime: 0,
      },
    });

    // Mock SceneManager
    mockSceneManager = {
      setTransitionConfig: vi.fn(),
      transitionTo: vi.fn().mockResolvedValue(undefined),
      dispose: vi.fn(),
    };

    (SceneManager as any).mockImplementation(() => mockSceneManager);

    // Clean up window global
    delete (window as any).__sceneTransition;
  });

  afterEach(() => {
    delete (window as any).__sceneTransition;
  });

  describe('Initialization', () => {
    it('should render children after initialization', async () => {
      render(
        <GameController>
          <div data-testid="test-content">Content</div>
        </GameController>
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-content')).toBeInTheDocument();
      });
    });

    it('should create SceneManager on mount', async () => {
      render(
        <GameController>
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        expect(SceneManager).toHaveBeenCalled();
      });
    });

    it('should configure SceneManager with fade transition', async () => {
      render(
        <GameController>
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        expect(mockSceneManager.setTransitionConfig).toHaveBeenCalledWith({
          type: 'fade',
          duration: 0.3,
          containerSelector: '#scene-container',
        });
      });
    });

    it('should start game loop on mount', async () => {
      render(
        <GameController>
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        const state = useGameStore.getState();
        // Game loop should be started (isRunning will be true after startGameLoop is called)
        expect(state.gameLoop.isRunning).toBe(true);
      });
    });
  });

  describe('Scene Management', () => {
    it('should set initial scene in store', async () => {
      render(
        <GameController initialScene="combat">
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        const state = useGameStore.getState();
        expect(state.ui.currentScene).toBe('combat');
      });
    });

    it('should default to mainMenu scene', async () => {
      render(
        <GameController>
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        const state = useGameStore.getState();
        expect(state.ui.currentScene).toBe('mainMenu');
      });
    });

    it('should call onSceneChange with initial scene', async () => {
      const onSceneChange = vi.fn();

      render(
        <GameController initialScene="victory" onSceneChange={onSceneChange}>
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        expect(onSceneChange).toHaveBeenCalledWith('victory');
      });
    });

    it('should expose scene transition method on window', async () => {
      render(
        <GameController>
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        expect((window as any).__sceneTransition).toBeDefined();
        expect(typeof (window as any).__sceneTransition).toBe('function');
      });
    });

    it('should handle scene transitions via window method', async () => {
      render(
        <GameController>
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        expect((window as any).__sceneTransition).toBeDefined();
      });

      await (window as any).__sceneTransition('combat');

      expect(mockSceneManager.transitionTo).toHaveBeenCalledWith('combat');
    });

    it('should update store during transition', async () => {
      render(
        <GameController>
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        expect((window as any).__sceneTransition).toBeDefined();
      });

      const transitionPromise = (window as any).__sceneTransition('combat');

      // Check that isTransitioning is set
      await waitFor(() => {
        const state = useGameStore.getState();
        expect(state.ui.isTransitioning).toBe(true);
      });

      await transitionPromise;

      // Check that transition is complete
      const state = useGameStore.getState();
      expect(state.ui.isTransitioning).toBe(false);
      expect(state.ui.currentScene).toBe('combat');
    });

    it('should call onSceneChange during transition', async () => {
      const onSceneChange = vi.fn();

      render(
        <GameController onSceneChange={onSceneChange}>
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        expect((window as any).__sceneTransition).toBeDefined();
      });

      await (window as any).__sceneTransition('combat');

      expect(onSceneChange).toHaveBeenCalledWith('combat');
    });
  });

  describe('Cleanup', () => {
    it('should dispose SceneManager on unmount', async () => {
      const { unmount } = render(
        <GameController>
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('game-controller-loading')).not.toBeInTheDocument();
      });

      unmount();

      expect(mockSceneManager.dispose).toHaveBeenCalled();
    });

    it('should stop game loop on unmount', async () => {
      const { unmount } = render(
        <GameController>
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('game-controller-loading')).not.toBeInTheDocument();
      });

      unmount();

      const state = useGameStore.getState();
      expect(state.gameLoop.isRunning).toBe(false);
    });

    it('should remove window transition method on unmount', async () => {
      const { unmount } = render(
        <GameController>
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        expect((window as any).__sceneTransition).toBeDefined();
      });

      unmount();

      expect((window as any).__sceneTransition).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle transition errors gracefully', async () => {
      mockSceneManager.transitionTo.mockRejectedValue(new Error('Transition failed'));

      render(
        <GameController>
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        expect((window as any).__sceneTransition).toBeDefined();
      });

      await expect((window as any).__sceneTransition('combat')).rejects.toThrow('Transition failed');

      // Should still reset transitioning state
      const state = useGameStore.getState();
      expect(state.ui.isTransitioning).toBe(false);
    });
  });

  describe('Props', () => {
    it('should accept custom initialScene', async () => {
      render(
        <GameController initialScene="victory">
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        const state = useGameStore.getState();
        expect(state.ui.currentScene).toBe('victory');
      });
    });

    it('should accept onSceneChange callback', async () => {
      const callback = vi.fn();

      render(
        <GameController onSceneChange={callback}>
          <div>Content</div>
        </GameController>
      );

      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith('mainMenu');
      });
    });

    it('should render any children', async () => {
      render(
        <GameController>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </GameController>
      );

      await waitFor(() => {
        expect(screen.getByTestId('child-1')).toBeInTheDocument();
        expect(screen.getByTestId('child-2')).toBeInTheDocument();
      });
    });
  });
});
