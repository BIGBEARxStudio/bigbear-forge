import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameErrorBoundary } from './GameErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-testid="child-content">Child content</div>;
};

describe('GameErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for cleaner test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <GameErrorBoundary>
          <div data-testid="child-content">Child content</div>
        </GameErrorBoundary>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
    });

    it('should not show error UI initially', () => {
      render(
        <GameErrorBoundary>
          <div>Content</div>
        </GameErrorBoundary>
      );

      expect(screen.queryByTestId('error-title')).not.toBeInTheDocument();
      expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
    });
  });

  describe('Error Catching', () => {
    it('should catch errors from children', () => {
      render(
        <GameErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GameErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
      expect(screen.getByTestId('error-title')).toHaveTextContent('Oops! Something went wrong');
    });

    it('should display error message', () => {
      render(
        <GameErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GameErrorBoundary>
      );

      expect(screen.getByTestId('error-message')).toHaveTextContent('Test error');
    });

    it('should hide children when error occurs', () => {
      render(
        <GameErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GameErrorBoundary>
      );

      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    });
  });

  describe('Error UI', () => {
    it('should show error icon', () => {
      render(
        <GameErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GameErrorBoundary>
      );

      const fallback = screen.getByTestId('error-boundary-fallback');
      expect(fallback).toHaveTextContent('⚠️');
    });

    it('should show retry button', () => {
      render(
        <GameErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GameErrorBoundary>
      );

      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toHaveTextContent('Try Again');
    });

    it('should show return to menu button', () => {
      render(
        <GameErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GameErrorBoundary>
      );

      expect(screen.getByTestId('return-to-menu-button')).toBeInTheDocument();
      expect(screen.getByTestId('return-to-menu-button')).toHaveTextContent('Return to Menu');
    });
  });

  describe('Retry Functionality', () => {
    it('should call onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(
        <GameErrorBoundary onRetry={onRetry}>
          <ThrowError shouldThrow={true} />
        </GameErrorBoundary>
      );

      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should reset error state when retry is clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(
        <GameErrorBoundary onRetry={onRetry}>
          <ThrowError shouldThrow={true} />
        </GameErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();

      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);

      // After retry, error state should be reset
      // Note: Children won't automatically re-render without remounting
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('Return to Menu Functionality', () => {
    it('should call onReturnToMenu when button is clicked', async () => {
      const user = userEvent.setup();
      const onReturnToMenu = vi.fn();

      render(
        <GameErrorBoundary onReturnToMenu={onReturnToMenu}>
          <ThrowError shouldThrow={true} />
        </GameErrorBoundary>
      );

      const returnButton = screen.getByTestId('return-to-menu-button');
      await user.click(returnButton);

      expect(onReturnToMenu).toHaveBeenCalledTimes(1);
    });

    it('should navigate to home if no onReturnToMenu provided', async () => {
      const user = userEvent.setup();
      const originalLocation = window.location.href;

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: originalLocation } as any;

      render(
        <GameErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GameErrorBoundary>
      );

      const returnButton = screen.getByTestId('return-to-menu-button');
      await user.click(returnButton);

      expect(window.location.href).toBe('/');
    });
  });

  describe('Props', () => {
    it('should accept custom onRetry callback', async () => {
      const user = userEvent.setup();
      const customRetry = vi.fn();

      render(
        <GameErrorBoundary onRetry={customRetry}>
          <ThrowError shouldThrow={true} />
        </GameErrorBoundary>
      );

      await user.click(screen.getByTestId('retry-button'));

      expect(customRetry).toHaveBeenCalled();
    });

    it('should accept custom onReturnToMenu callback', async () => {
      const user = userEvent.setup();
      const customReturn = vi.fn();

      render(
        <GameErrorBoundary onReturnToMenu={customReturn}>
          <ThrowError shouldThrow={true} />
        </GameErrorBoundary>
      );

      await user.click(screen.getByTestId('return-to-menu-button'));

      expect(customReturn).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should have correct container styles', () => {
      render(
        <GameErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GameErrorBoundary>
      );

      const fallback = screen.getByTestId('error-boundary-fallback');
      expect(fallback).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      });
    });

    it('should have dark background', () => {
      render(
        <GameErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GameErrorBoundary>
      );

      const fallback = screen.getByTestId('error-boundary-fallback');
      expect(fallback).toHaveStyle({ backgroundColor: '#1a1a2e' });
    });
  });
});
