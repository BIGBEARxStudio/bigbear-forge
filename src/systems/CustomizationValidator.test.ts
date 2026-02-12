import { describe, it, expect } from 'vitest';
import {
  validateCustomizationData,
  validateBodyPartType,
  validateAccessoryType,
  validateColorFormat,
} from './CustomizationValidator';
import type { CustomizationData } from '@/types';

describe('CustomizationValidator', () => {
  describe('validateCustomizationData', () => {
    it('should accept valid customization data', () => {
      const validData: CustomizationData = {
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

      expect(validateCustomizationData(validData)).toBe(true);
    });

    it('should accept valid data with accessories', () => {
      const validData: CustomizationData = {
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
          hat: 'cap',
          weapon: 'sword',
          shield: 'round',
        },
      };

      expect(validateCustomizationData(validData)).toBe(true);
    });

    it('should reject null data', () => {
      expect(validateCustomizationData(null)).toBe(false);
    });

    it('should reject undefined data', () => {
      expect(validateCustomizationData(undefined)).toBe(false);
    });

    it('should reject non-object data', () => {
      expect(validateCustomizationData('string')).toBe(false);
      expect(validateCustomizationData(123)).toBe(false);
      expect(validateCustomizationData(true)).toBe(false);
    });

    it('should reject data missing bodyParts', () => {
      const invalidData = {
        colors: {
          skin: '#ffdbac',
          hair: '#8b4513',
          clothing: '#4169e1',
        },
        accessories: {},
      };

      expect(validateCustomizationData(invalidData)).toBe(false);
    });

    it('should reject data with invalid bodyParts type', () => {
      const invalidData = {
        bodyParts: 'not an object',
        colors: {
          skin: '#ffdbac',
          hair: '#8b4513',
          clothing: '#4169e1',
        },
        accessories: {},
      };

      expect(validateCustomizationData(invalidData)).toBe(false);
    });

    it('should reject data missing required body part', () => {
      const invalidData = {
        bodyParts: {
          head: 'default',
          torso: 'default',
          arms: 'default',
          // missing legs
        },
        colors: {
          skin: '#ffdbac',
          hair: '#8b4513',
          clothing: '#4169e1',
        },
        accessories: {},
      };

      expect(validateCustomizationData(invalidData)).toBe(false);
    });

    it('should reject data with non-string body part', () => {
      const invalidData = {
        bodyParts: {
          head: 'default',
          torso: 123, // should be string
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

      expect(validateCustomizationData(invalidData)).toBe(false);
    });

    it('should reject data missing colors', () => {
      const invalidData = {
        bodyParts: {
          head: 'default',
          torso: 'default',
          arms: 'default',
          legs: 'default',
        },
        accessories: {},
      };

      expect(validateCustomizationData(invalidData)).toBe(false);
    });

    it('should reject data with invalid colors type', () => {
      const invalidData = {
        bodyParts: {
          head: 'default',
          torso: 'default',
          arms: 'default',
          legs: 'default',
        },
        colors: 'not an object',
        accessories: {},
      };

      expect(validateCustomizationData(invalidData)).toBe(false);
    });

    it('should reject data missing required color', () => {
      const invalidData = {
        bodyParts: {
          head: 'default',
          torso: 'default',
          arms: 'default',
          legs: 'default',
        },
        colors: {
          skin: '#ffdbac',
          hair: '#8b4513',
          // missing clothing
        },
        accessories: {},
      };

      expect(validateCustomizationData(invalidData)).toBe(false);
    });

    it('should reject data with invalid color format', () => {
      const invalidData = {
        bodyParts: {
          head: 'default',
          torso: 'default',
          arms: 'default',
          legs: 'default',
        },
        colors: {
          skin: 'red', // should be hex format
          hair: '#8b4513',
          clothing: '#4169e1',
        },
        accessories: {},
      };

      expect(validateCustomizationData(invalidData)).toBe(false);
    });

    it('should reject data with short hex color', () => {
      const invalidData = {
        bodyParts: {
          head: 'default',
          torso: 'default',
          arms: 'default',
          legs: 'default',
        },
        colors: {
          skin: '#fff', // should be 6 digits
          hair: '#8b4513',
          clothing: '#4169e1',
        },
        accessories: {},
      };

      expect(validateCustomizationData(invalidData)).toBe(false);
    });

    it('should reject data with invalid hex characters', () => {
      const invalidData = {
        bodyParts: {
          head: 'default',
          torso: 'default',
          arms: 'default',
          legs: 'default',
        },
        colors: {
          skin: '#gggggg', // invalid hex
          hair: '#8b4513',
          clothing: '#4169e1',
        },
        accessories: {},
      };

      expect(validateCustomizationData(invalidData)).toBe(false);
    });

    it('should reject data with invalid accessories type', () => {
      const invalidData = {
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
        accessories: 'not an object',
      };

      expect(validateCustomizationData(invalidData)).toBe(false);
    });

    it('should reject data with non-string accessory value', () => {
      const invalidData = {
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
          hat: 123, // should be string
        },
      };

      expect(validateCustomizationData(invalidData)).toBe(false);
    });

    it('should accept data without accessories field', () => {
      const validData = {
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
      };

      expect(validateCustomizationData(validData)).toBe(true);
    });

    it('should accept uppercase hex colors', () => {
      const validData: CustomizationData = {
        bodyParts: {
          head: 'default',
          torso: 'default',
          arms: 'default',
          legs: 'default',
        },
        colors: {
          skin: '#FFDBAC',
          hair: '#8B4513',
          clothing: '#4169E1',
        },
        accessories: {},
      };

      expect(validateCustomizationData(validData)).toBe(true);
    });

    it('should accept mixed case hex colors', () => {
      const validData: CustomizationData = {
        bodyParts: {
          head: 'default',
          torso: 'default',
          arms: 'default',
          legs: 'default',
        },
        colors: {
          skin: '#FfDbAc',
          hair: '#8b4513',
          clothing: '#4169E1',
        },
        accessories: {},
      };

      expect(validateCustomizationData(validData)).toBe(true);
    });
  });

  describe('validateBodyPartType', () => {
    it('should accept valid body part types', () => {
      const validTypes = ['default', 'round', 'square', 'slim', 'broad', 'long', 'short'];

      validTypes.forEach((type) => {
        expect(validateBodyPartType(type)).toBe(true);
      });
    });

    it('should reject invalid body part types', () => {
      expect(validateBodyPartType('invalid')).toBe(false);
      expect(validateBodyPartType('unknown')).toBe(false);
      expect(validateBodyPartType('')).toBe(false);
    });
  });

  describe('validateAccessoryType', () => {
    it('should accept valid accessory types', () => {
      const validTypes = [
        'sword',
        'axe',
        'staff',
        'round',
        'kite',
        'tower',
        'cap',
        'helmet',
        'crown',
      ];

      validTypes.forEach((type) => {
        expect(validateAccessoryType(type)).toBe(true);
      });
    });

    it('should reject invalid accessory types', () => {
      expect(validateAccessoryType('invalid')).toBe(false);
      expect(validateAccessoryType('unknown')).toBe(false);
      expect(validateAccessoryType('')).toBe(false);
    });
  });

  describe('validateColorFormat', () => {
    it('should accept valid hex colors', () => {
      expect(validateColorFormat('#ffffff')).toBe(true);
      expect(validateColorFormat('#000000')).toBe(true);
      expect(validateColorFormat('#ff0000')).toBe(true);
      expect(validateColorFormat('#00ff00')).toBe(true);
      expect(validateColorFormat('#0000ff')).toBe(true);
      expect(validateColorFormat('#123456')).toBe(true);
      expect(validateColorFormat('#abcdef')).toBe(true);
      expect(validateColorFormat('#ABCDEF')).toBe(true);
      expect(validateColorFormat('#AbCdEf')).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      expect(validateColorFormat('ffffff')).toBe(false); // missing #
      expect(validateColorFormat('#fff')).toBe(false); // too short
      expect(validateColorFormat('#fffffff')).toBe(false); // too long
      expect(validateColorFormat('#gggggg')).toBe(false); // invalid characters
      expect(validateColorFormat('red')).toBe(false); // named color
      expect(validateColorFormat('rgb(255,0,0)')).toBe(false); // rgb format
      expect(validateColorFormat('')).toBe(false); // empty string
    });
  });
});
