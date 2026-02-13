import type { CustomizationData } from '../types';
import { validateCustomizationData } from './CustomizationValidator';

export interface AvatarPersistence {
  saveCustomization(avatarId: string, data: CustomizationData): void;
  loadCustomization(avatarId: string): CustomizationData | null;
  clearCustomization(avatarId: string): void;
}

export class LocalStoragePersistence implements AvatarPersistence {
  private readonly STORAGE_KEY_PREFIX = 'avatar_customization_';

  saveCustomization(avatarId: string, data: CustomizationData): void {
    try {
      const key = this.STORAGE_KEY_PREFIX + avatarId;
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.warn('Failed to save avatar customization:', error);
      // Gracefully handle errors - don't throw
    }
  }

  loadCustomization(avatarId: string): CustomizationData | null {
    try {
      const key = this.STORAGE_KEY_PREFIX + avatarId;
      const serialized = localStorage.getItem(key);
      
      if (!serialized) {
        return null;
      }

      const parsed = JSON.parse(serialized);
      
      // Validate the loaded data
      if (!validateCustomizationData(parsed)) {
        console.warn('Invalid customization data in localStorage, ignoring');
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn('Failed to load avatar customization:', error);
      return null;
    }
  }

  clearCustomization(avatarId: string): void {
    try {
      const key = this.STORAGE_KEY_PREFIX + avatarId;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear avatar customization:', error);
      // Gracefully handle errors - don't throw
    }
  }

  // Utility method to check if localStorage is available
  isAvailable(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // Utility method to get all stored avatar IDs
  getAllAvatarIds(): string[] {
    try {
      const ids: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
          ids.push(key.substring(this.STORAGE_KEY_PREFIX.length));
        }
      }
      return ids;
    } catch (error) {
      console.warn('Failed to get avatar IDs:', error);
      return [];
    }
  }

  // Utility method to clear all avatar customizations
  clearAll(): void {
    try {
      const ids = this.getAllAvatarIds();
      ids.forEach(id => this.clearCustomization(id));
    } catch (error) {
      console.warn('Failed to clear all customizations:', error);
    }
  }
}
