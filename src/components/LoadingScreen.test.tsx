import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingScreen } from './LoadingScreen';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('LoadingScreen', () => {
  describe('Rendering', () => {
    it('should render loading screen', () => {
      render(<LoadingScreen />);
      expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    });

    it('should render spinner', () => {
      render(<LoadingScreen />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render progress bar', () => {
      render(<LoadingScreen />);
      expect(screen.getByTestId('progress-bar-container')).toBeInTheDocument();
      expect(screen.getByTestId('progress-bar-fill')).toBeInTheDocument();
    });

    it('should render progress percentage', () => {
      render(<LoadingScreen />);
      expect(screen.getByTestId('progress-percentage')).toBeInTheDocument();
    });
  });

  describe('Progress', () => {
    it('should display default progress of 0%', () => {
      render(<LoadingScreen />);
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('0%');
    });

    it('should display custom progress', () => {
      render(<LoadingScreen progress={50} />);
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('50%');
    });

    it('should clamp progress to 0-100 range', () => {
      const { rerender } = render(<LoadingScreen progress={-10} />);
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('0%');

      rerender(<LoadingScreen progress={150} />);
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('100%');
    });

    it('should round progress to nearest integer', () => {
      render(<LoadingScreen progress={45.7} />);
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('46%');
    });
  });

  describe('Message', () => {
    it('should display default message', () => {
      render(<LoadingScreen />);
      expect(screen.getByTestId('loading-message')).toHaveTextContent('Loading...');
    });

    it('should display custom message', () => {
      render(<LoadingScreen message="Loading assets..." />);
      expect(screen.getByTestId('loading-message')).toHaveTextContent('Loading assets...');
    });
  });

  describe('Styling', () => {
    it('should have dark background', () => {
      render(<LoadingScreen />);
      const screen_el = screen.getByTestId('loading-screen');
      expect(screen_el).toHaveStyle({ backgroundColor: '#1a1a2e' });
    });

    it('should center content', () => {
      render(<LoadingScreen />);
      const screen_el = screen.getByTestId('loading-screen');
      expect(screen_el).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      });
    });

    it('should fill container', () => {
      render(<LoadingScreen />);
      const screen_el = screen.getByTestId('loading-screen');
      expect(screen_el).toHaveStyle({
        width: '100%',
        height: '100%',
      });
    });
  });

  describe('Props', () => {
    it('should accept custom className', () => {
      render(<LoadingScreen className="custom-class" />);
      const screen_el = screen.getByTestId('loading-screen');
      expect(screen_el).toHaveClass('loading-screen', 'custom-class');
    });

    it('should work without any props', () => {
      expect(() => render(<LoadingScreen />)).not.toThrow();
    });

    it('should accept all props together', () => {
      render(
        <LoadingScreen
          progress={75}
          message="Almost there..."
          className="test-class"
        />
      );
      expect(screen.getByTestId('loading-message')).toHaveTextContent('Almost there...');
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('75%');
    });
  });
});
