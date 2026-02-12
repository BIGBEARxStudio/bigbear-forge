import { describe, it, expect, beforeEach } from 'vitest';
import {
  PresetManagerImpl,
  PLAYER_PRESET,
  AI_PRESET,
} from './AvatarPresets';
import type { AvatarPreset } from '@/types';

describe('AvatarPresets', () => {
  describe('Default Presets', () => {
    it('should have player preset with correct structure', () => {
      expect(PLAYER_PRESET.id).toBe('player_default');
      expect(PLAYER_PRESET.name).toBe('Player Default');
      expect(PLAYER_PRESET.customization.bodyParts).toBeDefined();
      expect(PLAYER_PRESET.customization.colors).toBeDefined();
      expect(PLAYER_PRESET.customization.accessories).toBeDefined();
    });

    it('should have AI preset with correct structure', () => {
      expect(AI_PRESET.id).toBe('ai_default');
      expect(AI_PRESET.name).toBe('AI Opponent');
      expect(AI_PRESET.customization.bodyParts).toBeDefined();
      expect(AI_PRESET.customization.colors).toBeDefined();
      expect(AI_PRESET.customization.accessories).toBeDefined();
    });

    it('should have different colors for player and AI', () => {
      expect(PLAYER_PRESET.customization.colors).not.toEqual(
        AI_PRESET.customization.colors
      );
    });

    it('should have different accessories for player and AI', () => {
      expect(PLAYER_PRESET.customization.accessories).not.toEqual(
        AI_PRESET.customization.accessories
      );
    });
  });

  describe('PresetManager', () => {
    let manager: PresetManagerImpl;

    beforeEach(() => {
      manager = new PresetManagerImpl();
    });

    describe('Initialization', () => {
      it('should initialize with default presets', () => {
        const presets = manager.getAllPresets();
        expect(presets.length).toBeGreaterThanOrEqual(2);
      });

      it('should have player preset available', () => {
        const preset = manager.getPreset('player_default');
        expect(preset).not.toBeNull();
        expect(preset?.id).toBe('player_default');
      });

      it('should have AI preset available', () => {
        const preset = manager.getPreset('ai_default');
        expect(preset).not.toBeNull();
        expect(preset?.id).toBe('ai_default');
      });
    });

    describe('Get Preset', () => {
      it('should return preset by id', () => {
        const preset = manager.getPreset('player_default');
        expect(preset).not.toBeNull();
        expect(preset?.id).toBe('player_default');
      });

      it('should return null for non-existent preset', () => {
        const preset = manager.getPreset('non_existent');
        expect(preset).toBeNull();
      });
    });

    describe('Get All Presets', () => {
      it('should return all presets', () => {
        const presets = manager.getAllPresets();
        expect(presets.length).toBeGreaterThanOrEqual(2);
      });

      it('should include player and AI presets', () => {
        const presets = manager.getAllPresets();
        const ids = presets.map((p) => p.id);
        expect(ids).toContain('player_default');
        expect(ids).toContain('ai_default');
      });
    });

    describe('Create Preset', () => {
      it('should create new preset', () => {
        const customization = {
          bodyParts: {
            head: 'default',
            torso: 'default',
            arms: 'default',
            legs: 'default',
          },
          colors: {
            skin: '#ffffff',
            hair: '#000000',
            clothing: '#ff0000',
          },
          accessories: {},
        };

        const preset = manager.createPreset('Custom Preset', customization);

        expect(preset.id).toContain('custom_');
        expect(preset.name).toBe('Custom Preset');
        expect(preset.customization).toEqual(customization);
      });

      it('should add created preset to manager', () => {
        const customization = {
          bodyParts: {
            head: 'default',
            torso: 'default',
            arms: 'default',
            legs: 'default',
          },
          colors: {
            skin: '#ffffff',
            hair: '#000000',
            clothing: '#ff0000',
          },
          accessories: {},
        };

        const preset = manager.createPreset('Custom Preset', customization);
        const retrieved = manager.getPreset(preset.id);

        expect(retrieved).not.toBeNull();
        expect(retrieved?.id).toBe(preset.id);
      });

      it('should generate unique ids for multiple presets', () => {
        const customization = {
          bodyParts: {
            head: 'default',
            torso: 'default',
            arms: 'default',
            legs: 'default',
          },
          colors: {
            skin: '#ffffff',
            hair: '#000000',
            clothing: '#ff0000',
          },
          accessories: {},
        };

        const preset1 = manager.createPreset('Preset 1', customization);
        const preset2 = manager.createPreset('Preset 2', customization);

        expect(preset1.id).not.toBe(preset2.id);
      });
    });

    describe('Save Preset', () => {
      it('should save preset', () => {
        const preset: AvatarPreset = {
          id: 'test_preset',
          name: 'Test Preset',
          customization: {
            bodyParts: {
              head: 'default',
              torso: 'default',
              arms: 'default',
              legs: 'default',
            },
            colors: {
              skin: '#ffffff',
              hair: '#000000',
              clothing: '#ff0000',
            },
            accessories: {},
          },
        };

        manager.savePreset(preset);
        const retrieved = manager.getPreset('test_preset');

        expect(retrieved).not.toBeNull();
        expect(retrieved?.id).toBe('test_preset');
      });

      it('should update existing preset', () => {
        const preset: AvatarPreset = {
          id: 'player_default',
          name: 'Modified Player',
          customization: {
            bodyParts: {
              head: 'default',
              torso: 'default',
              arms: 'default',
              legs: 'default',
            },
            colors: {
              skin: '#ffffff',
              hair: '#000000',
              clothing: '#ff0000',
            },
            accessories: {},
          },
        };

        manager.savePreset(preset);
        const retrieved = manager.getPreset('player_default');

        expect(retrieved?.name).toBe('Modified Player');
      });
    });

    describe('Delete Preset', () => {
      it('should delete custom preset', () => {
        const preset = manager.createPreset('To Delete', {
          bodyParts: {
            head: 'default',
            torso: 'default',
            arms: 'default',
            legs: 'default',
          },
          colors: {
            skin: '#ffffff',
            hair: '#000000',
            clothing: '#ff0000',
          },
          accessories: {},
        });

        const deleted = manager.deletePreset(preset.id);
        expect(deleted).toBe(true);

        const retrieved = manager.getPreset(preset.id);
        expect(retrieved).toBeNull();
      });

      it('should not delete player default preset', () => {
        const deleted = manager.deletePreset('player_default');
        expect(deleted).toBe(false);

        const preset = manager.getPreset('player_default');
        expect(preset).not.toBeNull();
      });

      it('should not delete AI default preset', () => {
        const deleted = manager.deletePreset('ai_default');
        expect(deleted).toBe(false);

        const preset = manager.getPreset('ai_default');
        expect(preset).not.toBeNull();
      });

      it('should return false for non-existent preset', () => {
        const deleted = manager.deletePreset('non_existent');
        expect(deleted).toBe(false);
      });
    });

    describe('Extend Preset', () => {
      it('should extend preset with modifications', () => {
        const extended = manager.extendPreset('player_default', {
          colors: {
            skin: '#ffffff',
            hair: '#000000',
            clothing: '#ff0000',
          },
        });

        expect(extended).not.toBeNull();
        expect(extended?.customization.colors.skin).toBe('#ffffff');
        expect(extended?.customization.bodyParts).toEqual(
          PLAYER_PRESET.customization.bodyParts
        );
      });

      it('should preserve unmodified properties', () => {
        const extended = manager.extendPreset('player_default', {
          accessories: {
            hat: 'cap',
          },
        });

        expect(extended).not.toBeNull();
        expect(extended?.customization.colors).toEqual(
          PLAYER_PRESET.customization.colors
        );
        expect(extended?.customization.bodyParts).toEqual(
          PLAYER_PRESET.customization.bodyParts
        );
      });

      it('should return null for non-existent base preset', () => {
        const extended = manager.extendPreset('non_existent', {
          colors: {
            skin: '#ffffff',
            hair: '#000000',
            clothing: '#ff0000',
          },
        });

        expect(extended).toBeNull();
      });

      it('should generate unique id for extended preset', () => {
        const extended1 = manager.extendPreset('player_default', {
          colors: { skin: '#ffffff', hair: '#000000', clothing: '#ff0000' },
        });
        const extended2 = manager.extendPreset('player_default', {
          colors: { skin: '#000000', hair: '#ffffff', clothing: '#00ff00' },
        });

        expect(extended1?.id).not.toBe(extended2?.id);
      });
    });

    describe('Serialization', () => {
      it('should serialize preset to JSON', () => {
        const json = manager.serializePreset(PLAYER_PRESET);
        expect(json).toBeTruthy();
        expect(typeof json).toBe('string');
      });

      it('should deserialize preset from JSON', () => {
        const json = manager.serializePreset(PLAYER_PRESET);
        const deserialized = manager.deserializePreset(json);

        expect(deserialized).not.toBeNull();
        expect(deserialized?.id).toBe(PLAYER_PRESET.id);
        expect(deserialized?.name).toBe(PLAYER_PRESET.name);
      });

      it('should handle round-trip serialization', () => {
        const json = manager.serializePreset(PLAYER_PRESET);
        const deserialized = manager.deserializePreset(json);

        expect(deserialized).toEqual(PLAYER_PRESET);
      });

      it('should return null for invalid JSON', () => {
        const deserialized = manager.deserializePreset('invalid json');
        expect(deserialized).toBeNull();
      });

      it('should return null for incomplete preset data', () => {
        const incomplete = JSON.stringify({ id: 'test' });
        const deserialized = manager.deserializePreset(incomplete);
        expect(deserialized).toBeNull();
      });
    });
  });
});
