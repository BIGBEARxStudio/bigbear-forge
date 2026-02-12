/**
 * AI Opponent System
 * 
 * Implements an easy-difficulty AI that makes random card selections
 * with occasional suboptimal moves and realistic play delays.
 */

import type { Card } from '@/types';

export interface AIConfig {
  minPlayDelay: number; // Minimum delay in milliseconds
  maxPlayDelay: number; // Maximum delay in milliseconds
  suboptimalMoveChance: number; // Probability of making suboptimal move (0-1)
}

/**
 * EasyAI - Simple AI opponent with random card selection
 */
export class EasyAI {
  private config: AIConfig;
  
  constructor(config?: Partial<AIConfig>) {
    this.config = {
      minPlayDelay: 1000,
      maxPlayDelay: 2000,
      suboptimalMoveChance: 0.3,
      ...config,
    };
  }
  
  /**
   * Select a card from the AI's hand
   * Returns the index of the selected card
   */
  selectCard(hand: Card[]): number {
    if (hand.length === 0) {
      throw new Error('Cannot select card from empty hand');
    }
    
    // Check if AI should make suboptimal move
    if (this.shouldMakeSuboptimalMove()) {
      // Select a random card (potentially suboptimal)
      return Math.floor(Math.random() * hand.length);
    }
    
    // Select best card (highest attack)
    return this.selectBestCard(hand);
  }
  
  /**
   * Select the best card from hand (highest attack stat)
   */
  private selectBestCard(hand: Card[]): number {
    let bestIndex = 0;
    let bestAttack = hand[0].stats.attack;
    
    for (let i = 1; i < hand.length; i++) {
      if (hand[i].stats.attack > bestAttack) {
        bestAttack = hand[i].stats.attack;
        bestIndex = i;
      }
    }
    
    return bestIndex;
  }
  
  /**
   * Get random play delay in milliseconds
   * Returns a value between minPlayDelay and maxPlayDelay
   */
  getPlayDelay(): number {
    const min = this.config.minPlayDelay;
    const max = this.config.maxPlayDelay;
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Determine if AI should make a suboptimal move
   * Returns true with probability equal to suboptimalMoveChance
   */
  shouldMakeSuboptimalMove(): boolean {
    return Math.random() < this.config.suboptimalMoveChance;
  }
  
  /**
   * Execute AI turn with delay
   * Returns a promise that resolves with the selected card index
   */
  async executeTurn(hand: Card[]): Promise<number> {
    const delay = this.getPlayDelay();
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return this.selectCard(hand);
  }
  
  /**
   * Update AI configuration
   */
  updateConfig(config: Partial<AIConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
  
  /**
   * Get current AI configuration
   */
  getConfig(): AIConfig {
    return { ...this.config };
  }
}
