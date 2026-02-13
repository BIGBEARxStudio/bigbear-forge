import { useState, useEffect, useCallback } from 'react';

export interface GameSettings {
  volume: number; // 0-100
  musicVolume: number; // 0-100
  sfxVolume: number; // 0-100
  showPerformanceMonitor: boolean;
  reducedMotion: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  volume: 70,
  musicVolume: 50,
  sfxVolume: 70,
  showPerformanceMonitor: false,
  reducedMotion: false,
};

const SETTINGS_KEY = 'bigbear-game-settings';

/**
 * useSettings - Hook for managing game settings
 * Persists settings to localStorage and provides update methods
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
      return updated;
    });
  }, []);

  // Update individual setting
  const updateSetting = useCallback(
    <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
      saveSettings({ [key]: value });
    },
    [saveSettings]
  );

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }, []);

  return {
    settings,
    isLoaded,
    updateSetting,
    saveSettings,
    resetSettings,
  };
};
