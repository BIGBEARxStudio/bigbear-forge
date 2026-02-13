import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VictoryDefeatSceneComponent } from './VictoryDefeatSceneComponent';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

describe('VictoryDefeatSceneComponent', () => {
  beforeEach(() => {
    delete (window as any).__sceneTransition;
  });

  describe('Rendering', () => {
    it('should render victory/defeat scene', () => {
      render(<VictoryDefeatSceneComponent isVictory={true} />);
      expect(screen.getByTestId('victory-defeat-scene')).toBeInTheDocument();
    });

    it('should render result title', () => {
      render(<VictoryDefeatSceneComponent isVictory={true} />);
      expect(screen.getByTestId('result-title')).toBeInTheDocument();
    });

    it('should render result message', () => {
      render(<VictoryDefeatSceneComponent isVictory={true} />);
      expect(screen.getByTestId('result-message')).toBeInTheDocument();
    });

    it('should render play again button', () => {
      render(<VictoryDefeatSceneComponent isVictory={true} />);
      expect(screen.getByTestId('play-again-button')).toBeInTheDocument();
    });

    it('should render return to menu button', () => {
      render(<VictoryDefeatSceneComponent isVictory={true} />);
      expect(screen.getByTestId('return-to-menu-button')).toBeInTheDocument();
    });
  });

  describe('Victory State', () => {
    it('should show victory title', () => {
      render(<VictoryDefeatSceneComponent isVictory={true} />);
      expect(screen.getByTestId('result-title')).toHaveTextContent('Victory!');
    });

    it('should show victory message', () => {
      render(<VictoryDefeatSceneComponent isVictory={true} />);
      expect(screen.getByTestId('result-message')).toHaveTextContent(
        'You have defeated your opponent!'
      );
    });

    it('should show trophy icon', () => {
      render(<VictoryDefeatSceneComponent isVictory={true} />);
      expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('should have gold gradient styling', () => {
      render(<VictoryDefeatSceneComponent isVictory={true} />);
      const title = screen.getByTestId('result-title');
      expect(title).toHaveStyle({
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      });
    });
  });

  describe('Defeat State', () => {
    it('should show defeat title', () => {
      render(<VictoryDefeatSceneComponent isVictory={false} />);
      expect(screen.getByTestId('result-title')).toHaveTextContent('Defeat!');
    });

    it('should show defeat message', () => {
      render(<VictoryDefeatSceneComponent isVictory={false} />);
      expect(screen.getByTestId('result-message')).toHaveTextContent(
        'Better luck next time!'
      );
    });

    it('should show skull icon', () => {
      render(<VictoryDefeatSceneComponent isVictory={false} />);
      expect(screen.getByText('💀')).toBeInTheDocument();
    });

    it('should have red gradient styling', () => {
      render(<VictoryDefeatSceneComponent isVictory={false} />);
      const title = screen.getByTestId('result-title');
      expect(title).toHaveStyle({
        background: 'linear-gradient(135deg, #f44336 0%, #9c27b0 100%)',
      });
    });
  });

  describe('Play Again Button', () => {
    it('should call onPlayAgain when clicked', () => {
      const onPlayAgain = vi.fn();
      render(
        <VictoryDefeatSceneComponent isVictory={true} onPlayAgain={onPlayAgain} />
      );

      fireEvent.click(screen.getByTestId('play-again-button'));
      expect(onPlayAgain).toHaveBeenCalledTimes(1);
    });

    it('should transition to combat scene when clicked without callback', () => {
      const mockTransition = vi.fn();
      (window as any).__sceneTransition = mockTransition;

      render(<VictoryDefeatSceneComponent isVictory={true} />);

      fireEvent.click(screen.getByTestId('play-again-button'));
      expect(mockTransition).toHaveBeenCalledWith('combat');
    });

    it('should not crash if no callback and no scene transition', () => {
      render(<VictoryDefeatSceneComponent isVictory={true} />);
      expect(() =>
        fireEvent.click(screen.getByTestId('play-again-button'))
      ).not.toThrow();
    });
  });

  describe('Return to Menu Button', () => {
    it('should call onReturnToMenu when clicked', () => {
      const onReturnToMenu = vi.fn();
      render(
        <VictoryDefeatSceneComponent
          isVictory={true}
          onReturnToMenu={onReturnToMenu}
        />
      );

      fireEvent.click(screen.getByTestId('return-to-menu-button'));
      expect(onReturnToMenu).toHaveBeenCalledTimes(1);
    });

    it('should transition to main menu when clicked without callback', () => {
      const mockTransition = vi.fn();
      (window as any).__sceneTransition = mockTransition;

      render(<VictoryDefeatSceneComponent isVictory={true} />);

      fireEvent.click(screen.getByTestId('return-to-menu-button'));
      expect(mockTransition).toHaveBeenCalledWith('mainMenu');
    });

    it('should not crash if no callback and no scene transition', () => {
      render(<VictoryDefeatSceneComponent isVictory={true} />);
      expect(() =>
        fireEvent.click(screen.getByTestId('return-to-menu-button'))
      ).not.toThrow();
    });
  });

  describe('Layout', () => {
    it('should center content', () => {
      render(<VictoryDefeatSceneComponent isVictory={true} />);
      const scene = screen.getByTestId('victory-defeat-scene');
      expect(scene).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      });
    });

    it('should use column layout', () => {
      render(<VictoryDefeatSceneComponent isVictory={true} />);
      const scene = screen.getByTestId('victory-defeat-scene');
      expect(scene).toHaveStyle({ flexDirection: 'column' });
    });

    it('should fill container', () => {
      render(<VictoryDefeatSceneComponent isVictory={true} />);
      const scene = screen.getByTestId('victory-defeat-scene');
      expect(scene).toHaveStyle({
        width: '100%',
        height: '100%',
      });
    });
  });

  describe('Props', () => {
    it('should accept onPlayAgain callback', () => {
      const callback = vi.fn();
      render(
        <VictoryDefeatSceneComponent isVictory={true} onPlayAgain={callback} />
      );
      fireEvent.click(screen.getByTestId('play-again-button'));
      expect(callback).toHaveBeenCalled();
    });

    it('should accept onReturnToMenu callback', () => {
      const callback = vi.fn();
      render(
        <VictoryDefeatSceneComponent
          isVictory={true}
          onReturnToMenu={callback}
        />
      );
      fireEvent.click(screen.getByTestId('return-to-menu-button'));
      expect(callback).toHaveBeenCalled();
    });

    it('should work with only isVictory prop', () => {
      expect(() =>
        render(<VictoryDefeatSceneComponent isVictory={true} />)
      ).not.toThrow();
    });
  });
});
