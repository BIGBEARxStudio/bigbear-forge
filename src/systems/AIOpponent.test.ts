import { describe, it, expect, beforeEach } from 'vitest';
import { EasyAI } from './AIOpponent';
import type { Card } from '@/types';

describe('AIOpponent', () => {
  let ai: EasyAI;
  
  const createMockCard = (id: string, attack: number): Card => ({
    id,
    name: `Card ${id}`,
    type: 'attack',
    rarity: 'common',
    stats: { attack, defense: 5, speed: 5 },
    artwork: '/test.png',
  });
  
  beforeEach(() => {
    ai = new EasyAI();
  });
  
  describe('Card Selection', () => {
    it('should select a valid card index from hand', () => {
      const hand = [
        createMockCard('1', 5),
        createMockCard('2', 8),
        createMockCard('3', 6),
      ];
      
      const selectedIndex = ai.selectCard(hand);
      
      expect(selectedIndex).toBeGreaterThanOrEqual(0);
      expect(selectedIndex).toBeLessThan(hand.length);
    });
    
    it('should throw error when selecting from empty hand', () => {
      expect(() => ai.selectCard([])).toThrow('Cannot select card from empty hand');
    });
    
    it('should select card from single-card hand', () => {
      const hand = [createMockCard('1', 10)];
      
      const selectedIndex = ai.selectCard(hand);
      
      expect(selectedIndex).toBe(0);
    });
    
    it('should select best card when not making suboptimal move', () => {
      // Create AI that never makes suboptimal moves
      const deterministicAI = new EasyAI({ suboptimalMoveChance: 0 });
      
      const hand = [
        createMockCard('1', 5),
        createMockCard('2', 12), // Best card
        createMockCard('3', 8),
      ];
      
      const selectedIndex = deterministicAI.selectCard(hand);
      
      expect(selectedIndex).toBe(1); // Should select highest attack
    });
    
    it('should select valid card even with 100% suboptimal chance', () => {
      const randomAI = new EasyAI({ suboptimalMoveChance: 1.0 });
      
      const hand = [
        createMockCard('1', 5),
        createMockCard('2', 8),
        createMockCard('3', 6),
      ];
      
      const selectedIndex = randomAI.selectCard(hand);
      
      expect(selectedIndex).toBeGreaterThanOrEqual(0);
      expect(selectedIndex).toBeLessThan(hand.length);
    });
  });
  
  describe('Play Delay', () => {
    it('should return delay within configured range', () => {
      const delay = ai.getPlayDelay();
      
      expect(delay).toBeGreaterThanOrEqual(1000);
      expect(delay).toBeLessThanOrEqual(2000);
    });
    
    it('should respect custom delay range', () => {
      const customAI = new EasyAI({
        minPlayDelay: 500,
        maxPlayDelay: 1000,
      });
      
      const delay = customAI.getPlayDelay();
      
      expect(delay).toBeGreaterThanOrEqual(500);
      expect(delay).toBeLessThanOrEqual(1000);
    });
    
    it('should handle same min and max delay', () => {
      const fixedDelayAI = new EasyAI({
        minPlayDelay: 1500,
        maxPlayDelay: 1500,
      });
      
      const delay = fixedDelayAI.getPlayDelay();
      
      expect(delay).toBe(1500);
    });
    
    it('should produce varying delays over multiple calls', () => {
      const delays = new Set<number>();
      
      for (let i = 0; i < 20; i++) {
        delays.add(ai.getPlayDelay());
      }
      
      // Should have some variation (not all the same)
      expect(delays.size).toBeGreaterThan(1);
    });
  });
  
  describe('Suboptimal Move Decision', () => {
    it('should never make suboptimal move with 0% chance', () => {
      const perfectAI = new EasyAI({ suboptimalMoveChance: 0 });
      
      for (let i = 0; i < 100; i++) {
        expect(perfectAI.shouldMakeSuboptimalMove()).toBe(false);
      }
    });
    
    it('should always make suboptimal move with 100% chance', () => {
      const randomAI = new EasyAI({ suboptimalMoveChance: 1.0 });
      
      for (let i = 0; i < 100; i++) {
        expect(randomAI.shouldMakeSuboptimalMove()).toBe(true);
      }
    });
    
    it('should make suboptimal moves approximately 30% of the time', () => {
      const iterations = 1000;
      let suboptimalCount = 0;
      
      for (let i = 0; i < iterations; i++) {
        if (ai.shouldMakeSuboptimalMove()) {
          suboptimalCount++;
        }
      }
      
      const percentage = suboptimalCount / iterations;
      
      // Should be roughly 30% (allow 10% margin)
      expect(percentage).toBeGreaterThan(0.2);
      expect(percentage).toBeLessThan(0.4);
    });
  });
  
  describe('Execute Turn', () => {
    it('should return valid card index after delay', async () => {
      const hand = [
        createMockCard('1', 5),
        createMockCard('2', 8),
        createMockCard('3', 6),
      ];
      
      const startTime = Date.now();
      const selectedIndex = await ai.executeTurn(hand);
      const elapsed = Date.now() - startTime;
      
      expect(selectedIndex).toBeGreaterThanOrEqual(0);
      expect(selectedIndex).toBeLessThan(hand.length);
      expect(elapsed).toBeGreaterThanOrEqual(1000);
    });
    
    it('should respect custom delay in executeTurn', async () => {
      const fastAI = new EasyAI({
        minPlayDelay: 100,
        maxPlayDelay: 200,
      });
      
      const hand = [createMockCard('1', 5)];
      
      const startTime = Date.now();
      await fastAI.executeTurn(hand);
      const elapsed = Date.now() - startTime;
      
      expect(elapsed).toBeGreaterThanOrEqual(100);
      expect(elapsed).toBeLessThan(300); // Allow some overhead
    });
  });
  
  describe('Configuration', () => {
    it('should use default configuration', () => {
      const config = ai.getConfig();
      
      expect(config.minPlayDelay).toBe(1000);
      expect(config.maxPlayDelay).toBe(2000);
      expect(config.suboptimalMoveChance).toBe(0.3);
    });
    
    it('should accept partial configuration', () => {
      const customAI = new EasyAI({ minPlayDelay: 500 });
      const config = customAI.getConfig();
      
      expect(config.minPlayDelay).toBe(500);
      expect(config.maxPlayDelay).toBe(2000); // Default
      expect(config.suboptimalMoveChance).toBe(0.3); // Default
    });
    
    it('should update configuration', () => {
      ai.updateConfig({ suboptimalMoveChance: 0.5 });
      const config = ai.getConfig();
      
      expect(config.suboptimalMoveChance).toBe(0.5);
      expect(config.minPlayDelay).toBe(1000); // Unchanged
    });
    
    it('should not mutate returned config', () => {
      const config1 = ai.getConfig();
      config1.minPlayDelay = 9999;
      
      const config2 = ai.getConfig();
      expect(config2.minPlayDelay).toBe(1000);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle hand with identical cards', () => {
      const hand = [
        createMockCard('1', 10),
        createMockCard('2', 10),
        createMockCard('3', 10),
      ];
      
      const selectedIndex = ai.selectCard(hand);
      
      expect(selectedIndex).toBeGreaterThanOrEqual(0);
      expect(selectedIndex).toBeLessThan(hand.length);
    });
    
    it('should handle very large hand', () => {
      const hand = Array.from({ length: 100 }, (_, i) => 
        createMockCard(`${i}`, Math.floor(Math.random() * 20))
      );
      
      const selectedIndex = ai.selectCard(hand);
      
      expect(selectedIndex).toBeGreaterThanOrEqual(0);
      expect(selectedIndex).toBeLessThan(hand.length);
    });
    
    it('should handle zero delay configuration', () => {
      const instantAI = new EasyAI({
        minPlayDelay: 0,
        maxPlayDelay: 0,
      });
      
      const delay = instantAI.getPlayDelay();
      expect(delay).toBe(0);
    });
  });
  
  describe('Selection Distribution', () => {
    it('should eventually select all cards with random selection', () => {
      const randomAI = new EasyAI({ suboptimalMoveChance: 1.0 });
      
      const hand = [
        createMockCard('1', 5),
        createMockCard('2', 8),
        createMockCard('3', 6),
      ];
      
      const selectedIndices = new Set<number>();
      
      // Run many iterations to ensure all cards are selected
      for (let i = 0; i < 100; i++) {
        selectedIndices.add(randomAI.selectCard(hand));
      }
      
      // Should have selected all possible indices
      expect(selectedIndices.size).toBe(hand.length);
    });
  });
});
