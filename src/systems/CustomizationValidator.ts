/**
 * Customization Validator
 * Validates avatar customization data before applying changes
 */

import type { CustomizationData } from '@/types';

export function validateCustomizationData(data: any): data is CustomizationData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check bodyParts
  if (!data.bodyParts || typeof data.bodyParts !== 'object') {
    return false;
  }

  const requiredParts = ['head', 'torso', 'arms', 'legs'];
  if (!requiredParts.every((part) => typeof data.bodyParts[part] === 'string')) {
    return false;
  }

  // Check colors
  if (!data.colors || typeof data.colors !== 'object') {
    return false;
  }

  const requiredColors = ['skin', 'hair', 'clothing'];
  if (!requiredColors.every((color) => typeof data.colors[color] === 'string')) {
    return false;
  }

  // Validate color format (hex colors)
  const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
  if (!requiredColors.every((color) => hexColorRegex.test(data.colors[color]))) {
    return false;
  }

  // Check accessories (optional)
  if (data.accessories !== undefined) {
    if (typeof data.accessories !== 'object') {
      return false;
    }

    // Validate optional accessory fields
    const optionalAccessories = ['hat', 'weapon', 'shield'];
    for (const accessory of optionalAccessories) {
      if (
        data.accessories[accessory] !== undefined &&
        typeof data.accessories[accessory] !== 'string'
      ) {
        return false;
      }
    }
  }

  return true;
}

export function validateBodyPartType(type: string): boolean {
  const validTypes = ['default', 'round', 'square', 'slim', 'broad', 'long', 'short'];
  return validTypes.includes(type);
}

export function validateAccessoryType(type: string): boolean {
  const validAccessories = [
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
  return validAccessories.includes(type);
}

export function validateColorFormat(color: string): boolean {
  const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
  return hexColorRegex.test(color);
}
