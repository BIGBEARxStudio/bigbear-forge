import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainMenuSceneComponent } from './MainMenuSceneComponent';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

describe('MainMenuSceneComponent', () => {
  beforeEach(() => {
    // Clean up window global
    delete (window as any).__sceneTransition;
  });

  describe('Rendering', () => {
    it('should render main menu scene', () => {
      render(<MainMenuSceneComponent />);
      expect(screen.getByTestId('main-menu-scene')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(<MainMenuSceneComponent />);
      expect(screen.getByText('Card Battle')).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      render(<MainMenuSceneComponent />);
      expect(screen.getByText('A Premium Portfolio Game')).toBeInTheDocument();
    });

    it('should render start battle button', () => {
      render(<MainMenuSceneComponent />);
      expect(screen.getByTestId('start-battle-button')).toBeInTheDocument();
      expect(screen.getByText('Start Battle')).toBeInTheDocument();
    });

    it('should render settings button', () => {
      render(<MainMenuSceneComponent />);
      expect(screen.getByTestId('settings-button')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should render avatar preview placeholder', () => {
      render(<MainMenuSceneComponent />);
      expect(screen.getByTestId('avatar-preview-placeholder')).toBeInTheDocument();
      expect(screen.getByText('Avatar customization coming soon')).toBeInTheDocument();
    });
  });

  describe('Start Battle Button', () => {
    it('should call onStartBattle when clicked', () => {
      const onStartBattle = vi.fn();
      render(<MainMenuSceneComponent onStartBattle={onStartBattle} />);

      const button = screen.getByTestId('start-battle-button');
      fireEvent.click(button);

      expect(onStartBattle).toHaveBeenCalledTimes(1);
    });

    it('should call scene transition when clicked without callback', () => {
      const mockTransition = vi.fn();
      (window as any).__sceneTransition = mockTransition;

      render(<MainMenuSceneComponent />);

      const button = screen.getByTestId('start-battle-button');
      fireEvent.click(button);

      expect(mockTransition).toHaveBeenCalledWith('combat');
    });

    it('should not crash if no callback and no scene transition', () => {
      render(<MainMenuSceneComponent />);

      const button = screen.getByTestId('start-battle-button');
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });

  describe('Settings Button', () => {
    it('should call onSettings when clicked', () => {
      const onSettings = vi.fn();
      render(<MainMenuSceneComponent onSettings={onSettings} />);

      const button = screen.getByTestId('settings-button');
      fireEvent.click(button);

      expect(onSettings).toHaveBeenCalledTimes(1);
    });

    it('should log to console when clicked without callback', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(<MainMenuSceneComponent />);

      const button = screen.getByTestId('settings-button');
      fireEvent.click(button);

      expect(consoleSpy).toHaveBeenCalledWith('Settings clicked');

      consoleSpy.mockRestore();
    });
  });

  describe('Styling', () => {
    it('should have gradient background on title', () => {
      render(<MainMenuSceneComponent />);
      const title = screen.getByText('Card Battle');
      
      expect(title).toHaveStyle({
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      });
    });

    it('should have gradient background on start battle button', () => {
      render(<MainMenuSceneComponent />);
      const button = screen.getByTestId('start-battle-button');
      
      expect(button).toHaveStyle({
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      });
    });

    it('should have semi-transparent background on settings button', () => {
      render(<MainMenuSceneComponent />);
      const button = screen.getByTestId('settings-button');
      
      expect(button).toHaveStyle({
        background: 'rgba(255, 255, 255, 0.1)',
      });
    });
  });

  describe('Responsive Design', () => {
    it('should use clamp for responsive title size', () => {
      render(<MainMenuSceneComponent />);
      const title = screen.getByText('Card Battle');
      
      expect(title).toHaveStyle({
        fontSize: 'clamp(2.5rem, 8vw, 5rem)',
      });
    });

    it('should have max-width on button container', () => {
      render(<MainMenuSceneComponent />);
      const buttons = screen.getByTestId('start-battle-button').parentElement;
      
      expect(buttons).toHaveStyle({
        maxWidth: '300px',
      });
    });
  });

  describe('Layout', () => {
    it('should center content vertically and horizontally', () => {
      render(<MainMenuSceneComponent />);
      const scene = screen.getByTestId('main-menu-scene');
      
      expect(scene).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      });
    });

    it('should use column layout', () => {
      render(<MainMenuSceneComponent />);
      const scene = screen.getByTestId('main-menu-scene');
      
      expect(scene).toHaveStyle({
        flexDirection: 'column',
      });
    });

    it('should have full width and height', () => {
      render(<MainMenuSceneComponent />);
      const scene = screen.getByTestId('main-menu-scene');
      
      expect(scene).toHaveStyle({
        width: '100%',
        height: '100%',
      });
    });
  });

  describe('Props', () => {
    it('should accept custom onStartBattle callback', () => {
      const callback = vi.fn();
      render(<MainMenuSceneComponent onStartBattle={callback} />);
      
      fireEvent.click(screen.getByTestId('start-battle-button'));
      expect(callback).toHaveBeenCalled();
    });

    it('should accept custom onSettings callback', () => {
      const callback = vi.fn();
      render(<MainMenuSceneComponent onSettings={callback} />);
      
      fireEvent.click(screen.getByTestId('settings-button'));
      expect(callback).toHaveBeenCalled();
    });

    it('should work without any props', () => {
      expect(() => render(<MainMenuSceneComponent />)).not.toThrow();
    });
  });
});
