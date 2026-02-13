/**
 * Asset Loader System
 * 
 * Handles lazy loading of game assets (cards, audio, images)
 * with caching and error recovery
 */

export interface AssetManifest {
  cards?: string[];
  audio?: string[];
  images?: string[];
}

export interface LoadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * AssetLoader - Lazy loads and caches game assets
 */
export class AssetLoader {
  private cache: Map<string, any>;
  private loading: Map<string, Promise<any>>;
  
  constructor() {
    this.cache = new Map();
    this.loading = new Map();
  }
  
  /**
   * Load a single asset with caching
   */
  async loadAsset(url: string, type: 'image' | 'audio' | 'json' = 'image'): Promise<any> {
    // Return cached asset if available
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    
    // Return in-progress load if already loading
    if (this.loading.has(url)) {
      return this.loading.get(url);
    }
    
    // Start new load
    const loadPromise = this.loadAssetInternal(url, type);
    this.loading.set(url, loadPromise);
    
    try {
      const asset = await loadPromise;
      this.cache.set(url, asset);
      return asset;
    } finally {
      this.loading.delete(url);
    }
  }
  
  /**
   * Load multiple assets with progress tracking
   */
  async loadAssets(
    manifest: AssetManifest,
    onProgress?: (progress: LoadProgress) => void
  ): Promise<void> {
    const allAssets: Array<{ url: string; type: 'image' | 'audio' | 'json' }> = [];
    
    if (manifest.cards) {
      allAssets.push(...manifest.cards.map(url => ({ url, type: 'json' as const })));
    }
    if (manifest.audio) {
      allAssets.push(...manifest.audio.map(url => ({ url, type: 'audio' as const })));
    }
    if (manifest.images) {
      allAssets.push(...manifest.images.map(url => ({ url, type: 'image' as const })));
    }
    
    const total = allAssets.length;
    let loaded = 0;
    
    const loadPromises = allAssets.map(async ({ url, type }) => {
      try {
        await this.loadAsset(url, type);
      } catch (error) {
        console.warn(`Failed to load asset: ${url}`, error);
      } finally {
        loaded++;
        if (onProgress) {
          onProgress({
            loaded,
            total,
            percentage: (loaded / total) * 100,
          });
        }
      }
    });
    
    await Promise.all(loadPromises);
  }
  
  /**
   * Get a cached asset
   */
  getAsset(url: string): any | undefined {
    return this.cache.get(url);
  }
  
  /**
   * Check if an asset is cached
   */
  hasAsset(url: string): boolean {
    return this.cache.has(url);
  }
  
  /**
   * Clear all cached assets
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Clear a specific asset from cache
   */
  clearAsset(url: string): void {
    this.cache.delete(url);
  }
  
  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
  
  private async loadAssetInternal(url: string, type: 'image' | 'audio' | 'json'): Promise<any> {
    switch (type) {
      case 'image':
        return this.loadImage(url);
      case 'audio':
        return this.loadAudio(url);
      case 'json':
        return this.loadJSON(url);
      default:
        throw new Error(`Unknown asset type: ${type}`);
    }
  }
  
  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }
  
  private async loadAudio(url: string): Promise<AudioBuffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load audio: ${url}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new AudioContext();
    return audioContext.decodeAudioData(arrayBuffer);
  }
  
  private async loadJSON(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${url}`);
    }
    return response.json();
  }
}
