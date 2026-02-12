/**
 * Web Audio Manager
 * 
 * Handles all game audio using the Web Audio API.
 * Supports sound effects, music, volume control, and muting.
 */

export interface AudioManifest {
  sounds: {
    [key: string]: string; // key: sound name, value: file path
  };
  music: {
    [key: string]: string; // key: music name, value: file path
  };
}

export interface AudioConfig {
  masterVolume?: number;
  soundVolume?: number;
  musicVolume?: number;
}

/**
 * WebAudioManager - Manages all game audio
 */
export class WebAudioManager {
  private context: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private music: Map<string, AudioBuffer> = new Map();
  private currentMusic: AudioBufferSourceNode | null = null;
  private musicGainNode: GainNode | null = null;
  private soundGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  
  private config: Required<AudioConfig> = {
    masterVolume: 1.0,
    soundVolume: 1.0,
    musicVolume: 0.7,
  };
  
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  
  /**
   * Initialize the audio context
   * Must be called after user interaction due to browser autoplay policies
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create gain nodes
      this.masterGainNode = this.context.createGain();
      this.soundGainNode = this.context.createGain();
      this.musicGainNode = this.context.createGain();
      
      // Connect gain nodes
      this.soundGainNode.connect(this.masterGainNode);
      this.musicGainNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.context.destination);
      
      // Set initial volumes
      this.masterGainNode.gain.value = this.config.masterVolume;
      this.soundGainNode.gain.value = this.config.soundVolume;
      this.musicGainNode.gain.value = this.config.musicVolume;
      
      // Resume context if suspended (browser autoplay policy)
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw error;
    }
  }
  
  /**
   * Load a sound from URL
   */
  async loadSound(name: string, url: string): Promise<void> {
    if (!this.context) {
      throw new Error('Audio context not initialized');
    }
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      
      this.sounds.set(name, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound: ${name}`, error);
      throw error;
    }
  }
  
  /**
   * Load music from URL
   */
  async loadMusic(name: string, url: string): Promise<void> {
    if (!this.context) {
      throw new Error('Audio context not initialized');
    }
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      
      this.music.set(name, audioBuffer);
    } catch (error) {
      console.error(`Failed to load music: ${name}`, error);
      throw error;
    }
  }
  
  /**
   * Load all assets from manifest
   */
  async loadManifest(manifest: AudioManifest): Promise<void> {
    const soundPromises = Object.entries(manifest.sounds).map(([name, url]) =>
      this.loadSound(name, url)
    );
    
    const musicPromises = Object.entries(manifest.music).map(([name, url]) =>
      this.loadMusic(name, url)
    );
    
    await Promise.all([...soundPromises, ...musicPromises]);
  }
  
  /**
   * Play a sound effect
   */
  playSound(name: string, volume: number = 1.0): void {
    if (!this.context || !this.soundGainNode || this.isMuted) return;
    
    const buffer = this.sounds.get(name);
    if (!buffer) {
      console.warn(`Sound not found: ${name}`);
      return;
    }
    
    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.soundGainNode);
    
    source.start(0);
  }
  
  /**
   * Play music (loops by default)
   */
  playMusic(name: string, loop: boolean = true): void {
    if (!this.context || !this.musicGainNode || this.isMuted) return;
    
    // Stop current music if playing
    this.stopMusic();
    
    const buffer = this.music.get(name);
    if (!buffer) {
      console.warn(`Music not found: ${name}`);
      return;
    }
    
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    
    source.connect(this.musicGainNode);
    source.start(0);
    
    this.currentMusic = source;
  }
  
  /**
   * Stop currently playing music
   */
  stopMusic(): void {
    if (this.currentMusic) {
      try {
        this.currentMusic.stop();
      } catch (error) {
        // Ignore errors if already stopped
      }
      this.currentMusic = null;
    }
  }
  
  /**
   * Set master volume (0.0 to 1.0)
   */
  setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.config.masterVolume;
    }
  }
  
  /**
   * Set sound effects volume (0.0 to 1.0)
   */
  setSoundVolume(volume: number): void {
    this.config.soundVolume = Math.max(0, Math.min(1, volume));
    if (this.soundGainNode) {
      this.soundGainNode.gain.value = this.config.soundVolume;
    }
  }
  
  /**
   * Set music volume (0.0 to 1.0)
   */
  setMusicVolume(volume: number): void {
    this.config.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.config.musicVolume;
    }
  }
  
  /**
   * Mute all audio
   */
  mute(): void {
    this.isMuted = true;
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = 0;
    }
  }
  
  /**
   * Unmute all audio
   */
  unmute(): void {
    this.isMuted = false;
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.config.masterVolume;
    }
  }
  
  /**
   * Toggle mute state
   */
  toggleMute(): void {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }
  
  /**
   * Get current mute state
   */
  isMutedState(): boolean {
    return this.isMuted;
  }
  
  /**
   * Get current configuration
   */
  getConfig(): Required<AudioConfig> {
    return { ...this.config };
  }
  
  /**
   * Check if audio context is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.context !== null;
  }
  
  /**
   * Get audio context state
   */
  getContextState(): AudioContextState | null {
    return this.context?.state ?? null;
  }
  
  /**
   * Resume audio context (for handling suspended state)
   */
  async resumeContext(): Promise<void> {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }
  
  /**
   * Cleanup and dispose of audio resources
   */
  dispose(): void {
    this.stopMusic();
    
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    
    this.sounds.clear();
    this.music.clear();
    this.isInitialized = false;
  }
}
