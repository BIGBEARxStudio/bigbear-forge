import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssetLoader } from './AssetLoader';

describe('AssetLoader', () => {
  let loader: AssetLoader;

  beforeEach(() => {
    loader = new AssetLoader();
  });

  describe('loadAsset', () => {
    it('should cache loaded assets', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      const asset1 = await loader.loadAsset('/test.json', 'json');
      const asset2 = await loader.loadAsset('/test.json', 'json');

      expect(asset1).toEqual(asset2);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should return cached asset immediately', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      await loader.loadAsset('/test.json', 'json');
      expect(loader.hasAsset('/test.json')).toBe(true);

      const cached = loader.getAsset('/test.json');
      expect(cached).toEqual({ data: 'test' });
    });

    it('should handle concurrent loads of same asset', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      const [asset1, asset2, asset3] = await Promise.all([
        loader.loadAsset('/test.json', 'json'),
        loader.loadAsset('/test.json', 'json'),
        loader.loadAsset('/test.json', 'json'),
      ]);

      expect(asset1).toEqual(asset2);
      expect(asset2).toEqual(asset3);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadAssets', () => {
    it('should load multiple assets', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      await loader.loadAssets({
        cards: ['/card1.json', '/card2.json'],
        images: [],
        audio: [],
      });

      expect(loader.hasAsset('/card1.json')).toBe(true);
      expect(loader.hasAsset('/card2.json')).toBe(true);
      expect(loader.getCacheSize()).toBe(2);
    });

    it('should track load progress', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      const progressUpdates: number[] = [];
      await loader.loadAssets(
        {
          cards: ['/card1.json', '/card2.json', '/card3.json'],
        },
        (progress) => {
          progressUpdates.push(progress.percentage);
        }
      );

      expect(progressUpdates).toHaveLength(3);
      expect(progressUpdates[2]).toBe(100);
    });

    it('should handle load failures gracefully', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'test1' }),
        })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'test3' }),
        });
      global.fetch = mockFetch;

      await loader.loadAssets({
        cards: ['/card1.json', '/card2.json', '/card3.json'],
      });

      expect(loader.hasAsset('/card1.json')).toBe(true);
      expect(loader.hasAsset('/card2.json')).toBe(false);
      expect(loader.hasAsset('/card3.json')).toBe(true);
    });
  });

  describe('cache management', () => {
    it('should clear all cached assets', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      await loader.loadAsset('/test1.json', 'json');
      await loader.loadAsset('/test2.json', 'json');
      expect(loader.getCacheSize()).toBe(2);

      loader.clearCache();
      expect(loader.getCacheSize()).toBe(0);
    });

    it('should clear specific asset', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      await loader.loadAsset('/test1.json', 'json');
      await loader.loadAsset('/test2.json', 'json');
      expect(loader.getCacheSize()).toBe(2);

      loader.clearAsset('/test1.json');
      expect(loader.getCacheSize()).toBe(1);
      expect(loader.hasAsset('/test1.json')).toBe(false);
      expect(loader.hasAsset('/test2.json')).toBe(true);
    });
  });

  describe('getAsset', () => {
    it('should return undefined for non-existent asset', () => {
      expect(loader.getAsset('/nonexistent.json')).toBeUndefined();
    });

    it('should return cached asset', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      global.fetch = mockFetch;

      await loader.loadAsset('/test.json', 'json');
      const asset = loader.getAsset('/test.json');
      expect(asset).toEqual({ data: 'test' });
    });
  });

  describe('error handling', () => {
    it('should handle fetch errors', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });
      global.fetch = mockFetch;

      await expect(loader.loadAsset('/missing.json', 'json')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      await expect(loader.loadAsset('/test.json', 'json')).rejects.toThrow();
    });
  });
});
