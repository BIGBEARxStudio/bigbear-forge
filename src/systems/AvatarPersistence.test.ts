import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LocalStoragePersistence } from './AvatarPersistence';
import type { CustomizationData } from '../types';

describe('LocalStoragePersistence', () => {
  let persistence: LocalStoragePersistence;
  const testAvatarId = 'test-avatar';
  const validCustomization: CustomizationData = {
    bodyParts: {
      head: 'default',
      torso: 'default',
      arms: 'default',
      legs: 'default',
    },
    colors: {
      skin: '#ffdbac',
      hair: '#8b4513',
      clothing: '#4169e1',
    },
    accessories: {
      weapon: 'sword',
    },
  };

  beforeEach(() => {
    persistence = new LocalStoragePersistence();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveCustomization', () => {
    it('should save customization data to localStorage', () => {
      persistence.saveCustomization(testAvatarId, validCustomization);

      const stored = localStorage.getItem('avatar_customization_test-avatar');
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!)).toEqual(validCustomization);
    });

    it('should overwrite existing customization', () => {
      const firstCustomization = { ...validCustomization };
      const secondCustomization = {
        ...validCustomization,
        colors: { ...validCustomization.colors, skin: '#ffffff' },
      };

      persistence.saveCustomization(testAvatarId, firstCustomization);
      persistence.saveCustomization(testAvatarId, secondCustomization);

      const loaded = persistence.loadCustomization(testAvatarId);
      expect(loaded?.colors.skin).toBe('#ffffff');
    });

    it('should handle multiple avatar IDs', () => {
      const avatar1 = { ...validCustomization };
      const avatar2 = {
        ...validCustomization,
        colors: { ...validCustomization.colors, clothing: '#ff0000' },
      };

      persistence.saveCustomization('avatar1', avatar1);
      persistence.saveCustomization('avatar2', avatar2);

      const loaded1 = persistence.loadCustomization('avatar1');
      const loaded2 = persistence.loadCustomization('avatar2');

      expect(loaded1?.colors.clothing).toBe('#4169e1');
      expect(loaded2?.colors.clothing).toBe('#ff0000');
    });

    it('should not throw on localStorage errors', () => {
      // Mock localStorage to throw
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => {
        persistence.saveCustomization(testAvatarId, validCustomization);
      }).not.toThrow();

      setItemSpy.mockRestore();
    });
  });

  describe('loadCustomization', () => {
    it('should load saved customization data', () => {
      persistence.saveCustomization(testAvatarId, validCustomization);
      const loaded = persistence.loadCustomization(testAvatarId);

      expect(loaded).toEqual(validCustomization);
    });

    it('should return null when no data exists', () => {
      const loaded = persistence.loadCustomization('non-existent');

      expect(loaded).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      localStorage.setItem('avatar_customization_test-avatar', 'invalid json{');

      const loaded = persistence.loadCustomization(testAvatarId);

      expect(loaded).toBeNull();
    });

    it('should return null for invalid customization data', () => {
      const invalidData = {
        bodyParts: { head: 'default' }, // Missing required fields
        colors: {},
      };

      localStorage.setItem(
        'avatar_customization_test-avatar',
        JSON.stringify(invalidData)
      );

      const loaded = persistence.loadCustomization(testAvatarId);

      expect(loaded).toBeNull();
    });

    it('should validate loaded data structure', () => {
      const corruptedData = {
        ...validCustomization,
        bodyParts: null, // Corrupted field
      };

      localStorage.setItem(
        'avatar_customization_test-avatar',
        JSON.stringify(corruptedData)
      );

      const loaded = persistence.loadCustomization(testAvatarId);

      expect(loaded).toBeNull();
    });

    it('should not throw on localStorage errors', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      getItemSpy.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      expect(() => {
        persistence.loadCustomization(testAvatarId);
      }).not.toThrow();

      const result = persistence.loadCustomization(testAvatarId);
      expect(result).toBeNull();

      getItemSpy.mockRestore();
    });
  });

  describe('clearCustomization', () => {
    it('should remove customization data', () => {
      persistence.saveCustomization(testAvatarId, validCustomization);
      expect(persistence.loadCustomization(testAvatarId)).not.toBeNull();

      persistence.clearCustomization(testAvatarId);
      expect(persistence.loadCustomization(testAvatarId)).toBeNull();
    });

    it('should not throw when clearing non-existent data', () => {
      expect(() => {
        persistence.clearCustomization('non-existent');
      }).not.toThrow();
    });

    it('should not throw on localStorage errors', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      removeItemSpy.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      expect(() => {
        persistence.clearCustomization(testAvatarId);
      }).not.toThrow();

      removeItemSpy.mockRestore();
    });
  });

  describe('isAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(persistence.isAvailable()).toBe(true);
    });

    it('should return false when localStorage throws', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      expect(persistence.isAvailable()).toBe(false);

      setItemSpy.mockRestore();
    });
  });

  describe('getAllAvatarIds', () => {
    it('should return empty array when no avatars stored', () => {
      const ids = persistence.getAllAvatarIds();

      expect(ids).toEqual([]);
    });

    it('should return all stored avatar IDs', () => {
      persistence.saveCustomization('avatar1', validCustomization);
      persistence.saveCustomization('avatar2', validCustomization);
      persistence.saveCustomization('avatar3', validCustomization);

      const ids = persistence.getAllAvatarIds();

      expect(ids).toHaveLength(3);
      expect(ids).toContain('avatar1');
      expect(ids).toContain('avatar2');
      expect(ids).toContain('avatar3');
    });

    it('should not return non-avatar keys', () => {
      persistence.saveCustomization('avatar1', validCustomization);
      localStorage.setItem('other_key', 'value');
      localStorage.setItem('another_key', 'value');

      const ids = persistence.getAllAvatarIds();

      expect(ids).toEqual(['avatar1']);
    });

    it('should handle localStorage errors gracefully', () => {
      const keySpy = vi.spyOn(Storage.prototype, 'key');
      keySpy.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const ids = persistence.getAllAvatarIds();

      expect(ids).toEqual([]);

      keySpy.mockRestore();
    });
  });

  describe('clearAll', () => {
    it('should clear all avatar customizations', () => {
      persistence.saveCustomization('avatar1', validCustomization);
      persistence.saveCustomization('avatar2', validCustomization);
      persistence.saveCustomization('avatar3', validCustomization);

      persistence.clearAll();

      expect(persistence.loadCustomization('avatar1')).toBeNull();
      expect(persistence.loadCustomization('avatar2')).toBeNull();
      expect(persistence.loadCustomization('avatar3')).toBeNull();
    });

    it('should not affect non-avatar keys', () => {
      persistence.saveCustomization('avatar1', validCustomization);
      localStorage.setItem('other_key', 'value');

      persistence.clearAll();

      expect(persistence.loadCustomization('avatar1')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('value');
    });

    it('should handle errors gracefully', () => {
      persistence.saveCustomization('avatar1', validCustomization);

      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      removeItemSpy.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      expect(() => {
        persistence.clearAll();
      }).not.toThrow();

      removeItemSpy.mockRestore();
    });
  });

  describe('persistence round trip', () => {
    it('should preserve all customization data', () => {
      const customization: CustomizationData = {
        bodyParts: {
          head: 'round',
          torso: 'slim',
          arms: 'long',
          legs: 'short',
        },
        colors: {
          skin: '#ffdbac',
          hair: '#8b4513',
          clothing: '#4169e1',
        },
        accessories: {
          hat: 'cap',
          weapon: 'sword',
          shield: 'round',
        },
      };

      persistence.saveCustomization(testAvatarId, customization);
      const loaded = persistence.loadCustomization(testAvatarId);

      expect(loaded).toEqual(customization);
    });

    it('should handle customization without accessories', () => {
      const customization: CustomizationData = {
        bodyParts: {
          head: 'default',
          torso: 'default',
          arms: 'default',
          legs: 'default',
        },
        colors: {
          skin: '#ffdbac',
          hair: '#8b4513',
          clothing: '#4169e1',
        },
        accessories: {},
      };

      persistence.saveCustomization(testAvatarId, customization);
      const loaded = persistence.loadCustomization(testAvatarId);

      expect(loaded).toEqual(customization);
    });

    it('should handle partial accessories', () => {
      const customization: CustomizationData = {
        bodyParts: {
          head: 'default',
          torso: 'default',
          arms: 'default',
          legs: 'default',
        },
        colors: {
          skin: '#ffdbac',
          hair: '#8b4513',
          clothing: '#4169e1',
        },
        accessories: {
          weapon: 'sword',
          // No hat or shield
        },
      };

      persistence.saveCustomization(testAvatarId, customization);
      const loaded = persistence.loadCustomization(testAvatarId);

      expect(loaded).toEqual(customization);
    });
  });

  describe('edge cases', () => {
    it('should handle very long avatar IDs', () => {
      const longId = 'a'.repeat(1000);
      persistence.saveCustomization(longId, validCustomization);
      const loaded = persistence.loadCustomization(longId);

      expect(loaded).toEqual(validCustomization);
    });

    it('should handle special characters in avatar IDs', () => {
      const specialId = 'avatar-123_test@domain.com';
      persistence.saveCustomization(specialId, validCustomization);
      const loaded = persistence.loadCustomization(specialId);

      expect(loaded).toEqual(validCustomization);
    });

    it('should handle rapid save/load operations', () => {
      for (let i = 0; i < 100; i++) {
        persistence.saveCustomization(testAvatarId, validCustomization);
        const loaded = persistence.loadCustomization(testAvatarId);
        expect(loaded).toEqual(validCustomization);
      }
    });

    it('should handle empty avatar ID', () => {
      persistence.saveCustomization('', validCustomization);
      const loaded = persistence.loadCustomization('');

      expect(loaded).toEqual(validCustomization);
    });
  });
});
