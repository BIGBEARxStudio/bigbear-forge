import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SceneRenderer } from './SceneRenderer';
import { useGameStore } from '@/stores/gameStore';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style, animate, ...props }: any) => {
      // Apply animate prop as inline style for testing
      const mergedStyle = { ...style, ...(typeof animate === 'object' ? animate : {}) };
      return <div {...props} style={mergedStyle}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('SceneRenderer', () => {
  beforeEach(() => {
    // Reset store
    useGameStore.setState({
      ui: {
        currentScene: 'mainMenu',
        isTransitioning: false,
        showPauseMenu: false,
      },
    });
  });

  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <SceneRenderer>
          <div data-testid="test-scene">Test Scene</div>
        </SceneRenderer>
      );

      expect(screen.getByTestId('test-scene')).toBeInTheDocument();
    });

    it('should render with scene-renderer test id', () => {
      render(
        <SceneRenderer>
          <div>Content</div>
        </SceneRenderer>
      );

      expect(screen.getByTestId('scene-renderer')).toBeInTheDocument();
    });

    it('should set data-scene attribute to current scene', () => {
      useGameStore.setState({
        ui: {
          currentScene: 'combat',
          isTransitioning: false,
          showPauseMenu: false,
        },
      });

      render(
        <SceneRenderer>
          <div>Content</div>
        </SceneRenderer>
      );

      const renderer = screen.getByTestId('scene-renderer');
      expect(renderer).toHaveAttribute('data-scene', 'combat');
    });
  });

  describe('Loading States', () => {
    it('should show default loading fallback during suspense', async () => {
      const LazyComponent = () => {
        throw new Promise(() => {}); // Never resolves
      };

      render(
        <SceneRenderer>
          <LazyComponent />
        </SceneRenderer>
      );

      await waitFor(() => {
        expect(screen.getByTestId('scene-loading')).toBeInTheDocument();
      });
    });

    it('should show custom fallback when provided', async () => {
      const LazyComponent = () => {
        throw new Promise(() => {}); // Never resolves
      };

      const customFallback = <div data-testid="custom-loading">Custom Loading</div>;

      render(
        <SceneRenderer fallback={customFallback}>
          <LazyComponent />
        </SceneRenderer>
      );

      await waitFor(() => {
        expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
      });
    });

    it('should display loading text in default fallback', async () => {
      const LazyComponent = () => {
        throw new Promise(() => {}); // Never resolves
      };

      render(
        <SceneRenderer>
          <LazyComponent />
        </SceneRenderer>
      );

      await waitFor(() => {
        expect(screen.getByText('Loading scene...')).toBeInTheDocument();
      });
    });
  });

  describe('Transitions', () => {
    it('should apply opacity 0 when transitioning', () => {
      useGameStore.setState({
        ui: {
          currentScene: 'mainMenu',
          isTransitioning: true,
          showPauseMenu: false,
        },
      });

      render(
        <SceneRenderer>
          <div>Content</div>
        </SceneRenderer>
      );

      const renderer = screen.getByTestId('scene-renderer');
      expect(renderer).toHaveStyle({ opacity: 0 });
    });

    it('should apply opacity 1 when not transitioning', () => {
      useGameStore.setState({
        ui: {
          currentScene: 'mainMenu',
          isTransitioning: false,
          showPauseMenu: false,
        },
      });

      render(
        <SceneRenderer>
          <div>Content</div>
        </SceneRenderer>
      );

      const renderer = screen.getByTestId('scene-renderer');
      expect(renderer).toHaveStyle({ opacity: 1 });
    });

    it('should update when scene changes', () => {
      const { rerender } = render(
        <SceneRenderer>
          <div>Content</div>
        </SceneRenderer>
      );

      expect(screen.getByTestId('scene-renderer')).toHaveAttribute('data-scene', 'mainMenu');

      useGameStore.setState({
        ui: {
          currentScene: 'combat',
          isTransitioning: false,
          showPauseMenu: false,
        },
      });

      rerender(
        <SceneRenderer>
          <div>Content</div>
        </SceneRenderer>
      );

      expect(screen.getByTestId('scene-renderer')).toHaveAttribute('data-scene', 'combat');
    });
  });

  describe('Styling', () => {
    it('should apply full width and height', () => {
      render(
        <SceneRenderer>
          <div>Content</div>
        </SceneRenderer>
      );

      const renderer = screen.getByTestId('scene-renderer');
      expect(renderer).toHaveStyle({
        width: '100%',
        height: '100%',
      });
    });
  });

  describe('Store Integration', () => {
    it('should react to currentScene changes', () => {
      const { rerender } = render(
        <SceneRenderer>
          <div>Content</div>
        </SceneRenderer>
      );

      useGameStore.setState({
        ui: {
          currentScene: 'victory',
          isTransitioning: false,
          showPauseMenu: false,
        },
      });

      rerender(
        <SceneRenderer>
          <div>Content</div>
        </SceneRenderer>
      );

      expect(screen.getByTestId('scene-renderer')).toHaveAttribute('data-scene', 'victory');
    });

    it('should react to isTransitioning changes', () => {
      const { rerender } = render(
        <SceneRenderer>
          <div>Content</div>
        </SceneRenderer>
      );

      expect(screen.getByTestId('scene-renderer')).toHaveStyle({ opacity: 1 });

      useGameStore.setState({
        ui: {
          currentScene: 'mainMenu',
          isTransitioning: true,
          showPauseMenu: false,
        },
      });

      rerender(
        <SceneRenderer>
          <div>Content</div>
        </SceneRenderer>
      );

      expect(screen.getByTestId('scene-renderer')).toHaveStyle({ opacity: 0 });
    });
  });
});
