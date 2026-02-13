import { useEffect, useCallback } from 'react';

export interface KeyboardControlsConfig {
  // Navigation
  onTabNavigation?: (direction: 'forward' | 'backward') => void;
  onEnterActivate?: () => void;
  onSpaceActivate?: () => void;
  onEscape?: () => void;
  
  // Card selection
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onNumberKey?: (number: number) => void;
  
  // Game controls
  onPause?: () => void;
  onMute?: () => void;
  
  // Enable/disable specific controls
  enabled?: boolean;
  enableNavigation?: boolean;
  enableCardSelection?: boolean;
  enableGameControls?: boolean;
}

/**
 * useKeyboardControls - Hook for handling keyboard input
 * Provides keyboard navigation, shortcuts, and accessibility features
 */
export const useKeyboardControls = (config: KeyboardControlsConfig = {}) => {
  const {
    onTabNavigation,
    onEnterActivate,
    onSpaceActivate,
    onEscape,
    onArrowLeft,
    onArrowRight,
    onArrowUp,
    onArrowDown,
    onNumberKey,
    onPause,
    onMute,
    enabled = true,
    enableNavigation = true,
    enableCardSelection = true,
    enableGameControls = true,
  } = config;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Navigation controls
      if (enableNavigation) {
        if (event.key === 'Tab') {
          if (onTabNavigation) {
            event.preventDefault();
            onTabNavigation(event.shiftKey ? 'backward' : 'forward');
          }
        }

        if (event.key === 'Enter' && onEnterActivate) {
          event.preventDefault();
          onEnterActivate();
        }

        if (event.key === ' ' && onSpaceActivate) {
          event.preventDefault();
          onSpaceActivate();
        }

        if (event.key === 'Escape' && onEscape) {
          event.preventDefault();
          onEscape();
        }
      }

      // Card selection controls
      if (enableCardSelection) {
        if (event.key === 'ArrowLeft' && onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }

        if (event.key === 'ArrowRight' && onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }

        if (event.key === 'ArrowUp' && onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }

        if (event.key === 'ArrowDown' && onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }

        // Number keys 1-5 for card selection
        if (onNumberKey && /^[1-5]$/.test(event.key)) {
          event.preventDefault();
          onNumberKey(parseInt(event.key, 10));
        }
      }

      // Game controls
      if (enableGameControls) {
        if ((event.key === 'p' || event.key === 'P') && onPause) {
          event.preventDefault();
          onPause();
        }

        if ((event.key === 'm' || event.key === 'M') && onMute) {
          event.preventDefault();
          onMute();
        }
      }
    },
    [
      enabled,
      enableNavigation,
      enableCardSelection,
      enableGameControls,
      onTabNavigation,
      onEnterActivate,
      onSpaceActivate,
      onEscape,
      onArrowLeft,
      onArrowRight,
      onArrowUp,
      onArrowDown,
      onNumberKey,
      onPause,
      onMute,
    ]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    enabled,
  };
};
