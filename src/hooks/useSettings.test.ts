import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from './useSettings';

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with default settings', () => {
      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual({
        volume: 70,
        musicVolume: 50,
        sfxVolume: 70,
        showPerformanceMonitor: false,
        reducedMotion: false,
      });
    });

    it('should set isLoaded to true after initialization', async () => {
      const { result } = renderHook(() => useSettings());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isLoaded).toBe(true);
    });

    it('should load settings from localStorage if available', () => {
      const savedSettings = {
        volume: 50,
        musicVolume: 30,
        sfxVolume: 60,
        showPerformanceMonitor: true,
        reducedMotion: true,
      };

      localStorage.setItem('bigbear-game-settings', JSON.stringify(savedSettings));

      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual(savedSettings);
    });

    it('should merge saved settings with defaults', () => {
      const partialSettings = {
        volume: 50,
      };

      localStorage.setItem('bigbear-game-settings', JSON.stringify(partialSettings));

      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual({
        volume: 50,
        musicVolume: 50,
        sfxVolume: 70,
        showPerformanceMonitor: false,
        reducedMotion: false,
      });
    });
  });

  describe('updateSetting', () => {
    it('should update a single setting', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSetting('volume', 80);
      });

      expect(result.current.settings.volume).toBe(80);
    });

    it('should persist updated setting to localStorage', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSetting('volume', 80);
      });

      const stored = localStorage.getItem('bigbear-game-settings');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.volume).toBe(80);
    });

    it('should update multiple settings independently', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSetting('volume', 80);
        result.current.updateSetting('musicVolume', 40);
        result.current.updateSetting('showPerformanceMonitor', true);
      });

      expect(result.current.settings.volume).toBe(80);
      expect(result.current.settings.musicVolume).toBe(40);
      expect(result.current.settings.showPerformanceMonitor).toBe(true);
    });
  });

  describe('saveSettings', () => {
    it('should save multiple settings at once', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.saveSettings({
          volume: 90,
          musicVolume: 60,
          reducedMotion: true,
        });
      });

      expect(result.current.settings.volume).toBe(90);
      expect(result.current.settings.musicVolume).toBe(60);
      expect(result.current.settings.reducedMotion).toBe(true);
    });

    it('should persist all settings to localStorage', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.saveSettings({
          volume: 90,
          musicVolume: 60,
        });
      });

      const stored = localStorage.getItem('bigbear-game-settings');
      const parsed = JSON.parse(stored!);
      expect(parsed.volume).toBe(90);
      expect(parsed.musicVolume).toBe(60);
    });
  });

  describe('resetSettings', () => {
    it('should reset settings to defaults', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSetting('volume', 90);
        result.current.updateSetting('showPerformanceMonitor', true);
      });

      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings).toEqual({
        volume: 70,
        musicVolume: 50,
        sfxVolume: 70,
        showPerformanceMonitor: false,
        reducedMotion: false,
      });
    });

    it('should remove settings from localStorage', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSetting('volume', 90);
      });

      expect(localStorage.getItem('bigbear-game-settings')).toBeTruthy();

      act(() => {
        result.current.resetSettings();
      });

      expect(localStorage.getItem('bigbear-game-settings')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage read errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useSettings());

      expect(result.current.isLoaded).toBe(true);
      expect(result.current.settings).toEqual({
        volume: 70,
        musicVolume: 50,
        sfxVolume: 70,
        showPerformanceMonitor: false,
        reducedMotion: false,
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle localStorage write errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSetting('volume', 80);
      });

      // Should still update in memory
      expect(result.current.settings.volume).toBe(80);

      consoleErrorSpy.mockRestore();
    });
  });
});
