import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardControls } from './useKeyboardControls';

describe('useKeyboardControls', () => {
  beforeEach(() => {
    // Clear any existing event listeners
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with enabled state', () => {
      const { result } = renderHook(() => useKeyboardControls());

      expect(result.current.enabled).toBe(true);
    });

    it('should respect enabled prop', () => {
      const { result } = renderHook(() =>
        useKeyboardControls({ enabled: false })
      );

      expect(result.current.enabled).toBe(false);
    });

    it('should add keydown event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      renderHook(() => useKeyboardControls());

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });

    it('should remove keydown event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useKeyboardControls());
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });

  describe('Navigation Controls', () => {
    it('should call onTabNavigation with forward direction', () => {
      const onTabNavigation = vi.fn();

      renderHook(() => useKeyboardControls({ onTabNavigation }));

      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      window.dispatchEvent(event);

      expect(onTabNavigation).toHaveBeenCalledWith('forward');
    });

    it('should call onTabNavigation with backward direction when Shift is pressed', () => {
      const onTabNavigation = vi.fn();

      renderHook(() => useKeyboardControls({ onTabNavigation }));

      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      window.dispatchEvent(event);

      expect(onTabNavigation).toHaveBeenCalledWith('backward');
    });

    it('should call onEnterActivate when Enter is pressed', () => {
      const onEnterActivate = vi.fn();

      renderHook(() => useKeyboardControls({ onEnterActivate }));

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      window.dispatchEvent(event);

      expect(onEnterActivate).toHaveBeenCalledTimes(1);
    });

    it('should call onSpaceActivate when Space is pressed', () => {
      const onSpaceActivate = vi.fn();

      renderHook(() => useKeyboardControls({ onSpaceActivate }));

      const event = new KeyboardEvent('keydown', { key: ' ' });
      window.dispatchEvent(event);

      expect(onSpaceActivate).toHaveBeenCalledTimes(1);
    });

    it('should call onEscape when Escape is pressed', () => {
      const onEscape = vi.fn();

      renderHook(() => useKeyboardControls({ onEscape }));

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);

      expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it('should not call navigation handlers when enableNavigation is false', () => {
      const onEnterActivate = vi.fn();
      const onEscape = vi.fn();

      renderHook(() =>
        useKeyboardControls({
          onEnterActivate,
          onEscape,
          enableNavigation: false,
        })
      );

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(onEnterActivate).not.toHaveBeenCalled();
      expect(onEscape).not.toHaveBeenCalled();
    });
  });

  describe('Card Selection Controls', () => {
    it('should call onArrowLeft when ArrowLeft is pressed', () => {
      const onArrowLeft = vi.fn();

      renderHook(() => useKeyboardControls({ onArrowLeft }));

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(onArrowLeft).toHaveBeenCalledTimes(1);
    });

    it('should call onArrowRight when ArrowRight is pressed', () => {
      const onArrowRight = vi.fn();

      renderHook(() => useKeyboardControls({ onArrowRight }));

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(event);

      expect(onArrowRight).toHaveBeenCalledTimes(1);
    });

    it('should call onArrowUp when ArrowUp is pressed', () => {
      const onArrowUp = vi.fn();

      renderHook(() => useKeyboardControls({ onArrowUp }));

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      window.dispatchEvent(event);

      expect(onArrowUp).toHaveBeenCalledTimes(1);
    });

    it('should call onArrowDown when ArrowDown is pressed', () => {
      const onArrowDown = vi.fn();

      renderHook(() => useKeyboardControls({ onArrowDown }));

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);

      expect(onArrowDown).toHaveBeenCalledTimes(1);
    });

    it('should call onNumberKey with correct number for keys 1-5', () => {
      const onNumberKey = vi.fn();

      renderHook(() => useKeyboardControls({ onNumberKey }));

      for (let i = 1; i <= 5; i++) {
        const event = new KeyboardEvent('keydown', { key: i.toString() });
        window.dispatchEvent(event);
      }

      expect(onNumberKey).toHaveBeenCalledTimes(5);
      expect(onNumberKey).toHaveBeenNthCalledWith(1, 1);
      expect(onNumberKey).toHaveBeenNthCalledWith(2, 2);
      expect(onNumberKey).toHaveBeenNthCalledWith(3, 3);
      expect(onNumberKey).toHaveBeenNthCalledWith(4, 4);
      expect(onNumberKey).toHaveBeenNthCalledWith(5, 5);
    });

    it('should not call onNumberKey for keys outside 1-5 range', () => {
      const onNumberKey = vi.fn();

      renderHook(() => useKeyboardControls({ onNumberKey }));

      window.dispatchEvent(new KeyboardEvent('keydown', { key: '0' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '6' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '9' }));

      expect(onNumberKey).not.toHaveBeenCalled();
    });

    it('should not call card selection handlers when enableCardSelection is false', () => {
      const onArrowLeft = vi.fn();
      const onNumberKey = vi.fn();

      renderHook(() =>
        useKeyboardControls({
          onArrowLeft,
          onNumberKey,
          enableCardSelection: false,
        })
      );

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));

      expect(onArrowLeft).not.toHaveBeenCalled();
      expect(onNumberKey).not.toHaveBeenCalled();
    });
  });

  describe('Game Controls', () => {
    it('should call onPause when P is pressed', () => {
      const onPause = vi.fn();

      renderHook(() => useKeyboardControls({ onPause }));

      const event = new KeyboardEvent('keydown', { key: 'p' });
      window.dispatchEvent(event);

      expect(onPause).toHaveBeenCalledTimes(1);
    });

    it('should call onPause when uppercase P is pressed', () => {
      const onPause = vi.fn();

      renderHook(() => useKeyboardControls({ onPause }));

      const event = new KeyboardEvent('keydown', { key: 'P' });
      window.dispatchEvent(event);

      expect(onPause).toHaveBeenCalledTimes(1);
    });

    it('should call onMute when M is pressed', () => {
      const onMute = vi.fn();

      renderHook(() => useKeyboardControls({ onMute }));

      const event = new KeyboardEvent('keydown', { key: 'm' });
      window.dispatchEvent(event);

      expect(onMute).toHaveBeenCalledTimes(1);
    });

    it('should call onMute when uppercase M is pressed', () => {
      const onMute = vi.fn();

      renderHook(() => useKeyboardControls({ onMute }));

      const event = new KeyboardEvent('keydown', { key: 'M' });
      window.dispatchEvent(event);

      expect(onMute).toHaveBeenCalledTimes(1);
    });

    it('should not call game control handlers when enableGameControls is false', () => {
      const onPause = vi.fn();
      const onMute = vi.fn();

      renderHook(() =>
        useKeyboardControls({
          onPause,
          onMute,
          enableGameControls: false,
        })
      );

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));

      expect(onPause).not.toHaveBeenCalled();
      expect(onMute).not.toHaveBeenCalled();
    });
  });

  describe('Enabled State', () => {
    it('should not handle any keys when enabled is false', () => {
      const onEnterActivate = vi.fn();
      const onArrowLeft = vi.fn();
      const onPause = vi.fn();

      renderHook(() =>
        useKeyboardControls({
          enabled: false,
          onEnterActivate,
          onArrowLeft,
          onPause,
        })
      );

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));

      expect(onEnterActivate).not.toHaveBeenCalled();
      expect(onArrowLeft).not.toHaveBeenCalled();
      expect(onPause).not.toHaveBeenCalled();
    });

    it('should not add event listener when enabled is false', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      renderHook(() => useKeyboardControls({ enabled: false }));

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Handlers', () => {
    it('should handle multiple key presses in sequence', () => {
      const onArrowLeft = vi.fn();
      const onArrowRight = vi.fn();
      const onEnterActivate = vi.fn();

      renderHook(() =>
        useKeyboardControls({
          onArrowLeft,
          onArrowRight,
          onEnterActivate,
        })
      );

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(onArrowLeft).toHaveBeenCalledTimes(1);
      expect(onArrowRight).toHaveBeenCalledTimes(1);
      expect(onEnterActivate).toHaveBeenCalledTimes(1);
    });
  });
});
