/**
 * Avatar Presets
 * Predefined avatar configurations for player and AI characters
 */

import type { AvatarPreset } from '@/types';

export const PLAYER_PRESET: AvatarPreset = {
  id: 'player_default',
  name: 'Player Default',
  customization: {
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
  },
};

export const AI_PRESET: AvatarPreset = {
  id: 'ai_default',
  name: 'AI Opponent',
  customization: {
    bodyParts: {
      head: 'default',
      torso: 'default',
      arms: 'default',
      legs: 'default',
    },
    colors: {
      skin: '#d4a574',
      hair: '#2c1810',
      clothing: '#dc143c',
    },
    accessories: {
      weapon: 'axe',
      shield: 'round',
    },
  },
};

export interface PresetManager {
  getPreset(id: string): AvatarPreset | null;
  getAllPresets(): AvatarPreset[];
  createPreset(name: string, customization: AvatarPreset['customization']): AvatarPreset;
  savePreset(preset: AvatarPreset): void;
  deletePreset(id: string): boolean;
}

export class PresetManagerImpl implements PresetManager {
  private presets: Map<string, AvatarPreset> = new Map();
  private idCounter: number = 0;

  constructor() {
    // Initialize with default presets
    this.presets.set(PLAYER_PRESET.id, PLAYER_PRESET);
    this.presets.set(AI_PRESET.id, AI_PRESET);
  }

  getPreset(id: string): AvatarPreset | null {
    return this.presets.get(id) || null;
  }

  getAllPresets(): AvatarPreset[] {
    return Array.from(this.presets.values());
  }

  createPreset(name: string, customization: AvatarPreset['customization']): AvatarPreset {
    const preset: AvatarPreset = {
      id: `custom_${Date.now()}_${this.idCounter++}`,
      name,
      customization,
    };
    this.presets.set(preset.id, preset);
    return preset;
  }

  savePreset(preset: AvatarPreset): void {
    this.presets.set(preset.id, preset);
  }

  deletePreset(id: string): boolean {
    // Don't allow deleting default presets
    if (id === PLAYER_PRESET.id || id === AI_PRESET.id) {
      return false;
    }
    return this.presets.delete(id);
  }

  // Utility method to extend a preset with modifications
  extendPreset(basePresetId: string, modifications: Partial<AvatarPreset['customization']>): AvatarPreset | null {
    const basePreset = this.getPreset(basePresetId);
    if (!basePreset) {
      return null;
    }

    const extendedCustomization: AvatarPreset['customization'] = {
      bodyParts: {
        ...basePreset.customization.bodyParts,
        ...(modifications.bodyParts || {}),
      },
      colors: {
        ...basePreset.customization.colors,
        ...(modifications.colors || {}),
      },
      accessories: {
        ...basePreset.customization.accessories,
        ...(modifications.accessories || {}),
      },
    };

    return {
      id: `extended_${basePresetId}_${Date.now()}_${this.idCounter++}`,
      name: `${basePreset.name} (Modified)`,
      customization: extendedCustomization,
    };
  }

  // Serialize preset to JSON
  serializePreset(preset: AvatarPreset): string {
    return JSON.stringify(preset);
  }

  // Deserialize preset from JSON
  deserializePreset(json: string): AvatarPreset | null {
    try {
      const preset = JSON.parse(json);
      // Basic validation
      if (!preset.id || !preset.name || !preset.customization) {
        return null;
      }
      return preset as AvatarPreset;
    } catch {
      return null;
    }
  }
}
