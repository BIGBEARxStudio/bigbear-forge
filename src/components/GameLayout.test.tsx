import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameLayout } from './GameLayout';

describe('GameLayout', () => {
  describe('Rendering', () => {
    it('should render layout container', () => {
      render(
        <GameLayout>
          <div>Test Content</div>
        </GameLayout>
      );

      expect(screen.getByTestId('game-layout')).toBeInTheDocument();
    });

    it('should render children in scene container', () => {
      render(
        <GameLayout>
          <div data-testid="test-child">Test Content</div>
        </GameLayout>
      );

      const sceneContainer = screen.getByTestId('scene-container');
      const child = screen.getByTestId('test-child');
      expect(sceneContainer).toContainElement(child);
    });

    it('should render UI overlay', () => {
      render(
        <GameLayout>
          <div>Test Content</div>
        </GameLayout>
      );

      expect(screen.getByTestId('ui-overlay')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <GameLayout className="custom-class">
          <div>Test Content</div>
        </GameLayout>
      );

      const layout = screen.getByTestId('game-layout');
      expect(layout.className).toContain('custom-class');
    });
  });

  describe('Performance Monitor', () => {
    it('should not show performance monitor by default', () => {
      const { container } = render(
        <GameLayout>
          <div>Test Content</div>
        </GameLayout>
      );

      const overlay = screen.getByTestId('ui-overlay');
      expect(overlay.children).toHaveLength(0);
    });

    it('should show performance monitor when enabled', () => {
      const { container } = render(
        <GameLayout showPerformanceMonitor>
          <div>Test Content</div>
        </GameLayout>
      );

      const overlay = screen.getByTestId('ui-overlay');
      expect(overlay.children.length).toBeGreaterThan(0);
    });
  });

  describe('Layout Structure', () => {
    it('should have fixed positioning', () => {
      render(
        <GameLayout>
          <div>Test Content</div>
        </GameLayout>
      );

      const layout = screen.getByTestId('game-layout');
      expect(layout).toHaveStyle({ position: 'fixed' });
    });

    it('should cover full viewport', () => {
      render(
        <GameLayout>
          <div>Test Content</div>
        </GameLayout>
      );

      const layout = screen.getByTestId('game-layout');
      const style = layout.getAttribute('style');
      expect(style).toContain('width: 100vw');
      expect(style).toContain('height: 100vh');
    });

    it('should have scene container with absolute positioning', () => {
      render(
        <GameLayout>
          <div>Test Content</div>
        </GameLayout>
      );

      const sceneContainer = screen.getByTestId('scene-container');
      expect(sceneContainer).toHaveStyle({ position: 'absolute' });
    });

    it('should have UI overlay above scene container', () => {
      render(
        <GameLayout>
          <div>Test Content</div>
        </GameLayout>
      );

      const sceneContainer = screen.getByTestId('scene-container');
      const uiOverlay = screen.getByTestId('ui-overlay');

      const sceneZIndex = parseInt(
        window.getComputedStyle(sceneContainer).zIndex
      );
      const overlayZIndex = parseInt(window.getComputedStyle(uiOverlay).zIndex);

      expect(overlayZIndex).toBeGreaterThan(sceneZIndex);
    });
  });
});
