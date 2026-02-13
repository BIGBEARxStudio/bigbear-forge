import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CombatSceneComponent } from './CombatSceneComponent';
import { useGameStore } from '@/stores/gameStore';

// Mock child components
vi.mock('./BattlefieldComponent', () => ({
  BattlefieldComponent: ({ playerHP, opponentHP }: any) => (
    <div data-testid="battlefield-component">
      Player: {playerHP} | Opponent: {opponentHP}
    </div>
  ),
}));

vi.mock('./CardHandComponent', () => ({
  CardHandComponent: ({ cards }: any) => (
    <div data-testid="card-hand-component">Cards: {cards.length}</div>
  ),
}));

vi.mock('./AvatarCanvas', () => ({
  AvatarCanvas: () => <div data-testid="avatar-canvas-component">Avatar Canvas</div>,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('CombatSceneComponent', () => {
  beforeEach(() => {
    // Reset store to default state
    useGameStore.setState({
      combat: {
        state: 'PLAYER_TURN',
        playerHP: 100,
        opponentHP: 100,
        currentTurn: 'player',
      },
      cards: {
        playerHand: [
          { id: '1', name: 'Card 1', stats: { attack: 5, defense: 3 }, type: 'attack', cost: 2 },
          { id: '2', name: 'Card 2', stats: { attack: 3, defense: 5 }, type: 'defense', cost: 2 },
        ],
        opponentHand: [],
        playerDeck: [],
        opponentDeck: [],
        selectedCardIndex: null,
        isDragging: false,
        dragPosition: null,
      },
      battlefield: {
        playerSide: {
          activeCard: null,
          hp: 100,
          maxHP: 100,
        },
        opponentSide: {
          activeCard: null,
          hp: 100,
          maxHP: 100,
        },
      },
    });
  });

  describe('Rendering', () => {
    it('should render combat scene', () => {
      render(<CombatSceneComponent />);
      expect(screen.getByTestId('combat-scene')).toBeInTheDocument();
    });

    it('should render avatar canvas', () => {
      render(<CombatSceneComponent />);
      expect(screen.getByTestId('avatar-canvas-component')).toBeInTheDocument();
    });

    it('should render battlefield component', () => {
      render(<CombatSceneComponent />);
      expect(screen.getByTestId('battlefield-component')).toBeInTheDocument();
    });

    it('should render card hand component', () => {
      render(<CombatSceneComponent />);
      expect(screen.getByTestId('card-hand-component')).toBeInTheDocument();
    });

    it('should render turn indicator', () => {
      render(<CombatSceneComponent />);
      expect(screen.getByTestId('turn-indicator')).toBeInTheDocument();
    });
  });

  describe('Turn Indicator', () => {
    it('should show player turn', () => {
      useGameStore.setState({
        combat: {
          state: 'PLAYER_TURN',
          playerHP: 100,
          opponentHP: 100,
          currentTurn: 'player',
        },
      });

      render(<CombatSceneComponent />);
      expect(screen.getByText('🎮 Your Turn')).toBeInTheDocument();
    });

    it('should show opponent turn', () => {
      useGameStore.setState({
        combat: {
          state: 'OPPONENT_TURN',
          playerHP: 100,
          opponentHP: 100,
          currentTurn: 'opponent',
        },
      });

      render(<CombatSceneComponent />);
      expect(screen.getByText('🤖 Opponent Turn')).toBeInTheDocument();
    });

    it('should have green styling for player turn', () => {
      useGameStore.setState({
        combat: {
          state: 'PLAYER_TURN',
          playerHP: 100,
          opponentHP: 100,
          currentTurn: 'player',
        },
      });

      render(<CombatSceneComponent />);
      const indicator = screen.getByTestId('turn-indicator');
      expect(indicator).toHaveStyle({
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        border: '2px solid #4CAF50',
      });
    });

    it('should have red styling for opponent turn', () => {
      useGameStore.setState({
        combat: {
          state: 'OPPONENT_TURN',
          playerHP: 100,
          opponentHP: 100,
          currentTurn: 'opponent',
        },
      });

      render(<CombatSceneComponent />);
      const indicator = screen.getByTestId('turn-indicator');
      expect(indicator).toHaveStyle({
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        border: '2px solid #f44336',
      });
    });
  });

  describe('Win/Loss Detection', () => {
    it('should call onVictory when opponent HP reaches 0', () => {
      const onVictory = vi.fn();

      useGameStore.setState({
        combat: {
          state: 'PLAYER_TURN',
          playerHP: 100,
          opponentHP: 0,
          currentTurn: 'player',
        },
      });

      render(<CombatSceneComponent onVictory={onVictory} />);

      expect(onVictory).toHaveBeenCalled();
    });

    it('should call onDefeat when player HP reaches 0', () => {
      const onDefeat = vi.fn();

      useGameStore.setState({
        combat: {
          state: 'OPPONENT_TURN',
          playerHP: 0,
          opponentHP: 100,
          currentTurn: 'opponent',
        },
      });

      render(<CombatSceneComponent onDefeat={onDefeat} />);

      expect(onDefeat).toHaveBeenCalled();
    });

    it('should not call callbacks when HP is above 0', () => {
      const onVictory = vi.fn();
      const onDefeat = vi.fn();

      render(<CombatSceneComponent onVictory={onVictory} onDefeat={onDefeat} />);

      expect(onVictory).not.toHaveBeenCalled();
      expect(onDefeat).not.toHaveBeenCalled();
    });

    it('should work without callbacks', () => {
      useGameStore.setState({
        combat: {
          state: 'PLAYER_TURN',
          playerHP: 0,
          opponentHP: 0,
          currentTurn: 'player',
        },
      });

      expect(() => render(<CombatSceneComponent />)).not.toThrow();
    });
  });

  describe('Layout', () => {
    it('should use grid layout', () => {
      render(<CombatSceneComponent />);
      const scene = screen.getByTestId('combat-scene');
      
      expect(scene).toHaveStyle({
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
      });
    });

    it('should have proper spacing', () => {
      render(<CombatSceneComponent />);
      const scene = screen.getByTestId('combat-scene');
      
      expect(scene).toHaveStyle({
        gap: '16px',
        padding: '20px',
      });
    });

    it('should fill container', () => {
      render(<CombatSceneComponent />);
      const scene = screen.getByTestId('combat-scene');
      
      expect(scene).toHaveStyle({
        width: '100%',
        height: '100%',
      });
    });
  });

  describe('Store Integration', () => {
    it('should pass player HP to battlefield', () => {
      useGameStore.setState({
        battlefield: {
          playerSide: {
            activeCard: null,
            hp: 75,
            maxHP: 100,
          },
          opponentSide: {
            activeCard: null,
            hp: 100,
            maxHP: 100,
          },
        },
      });

      render(<CombatSceneComponent />);
      expect(screen.getByText(/Player: 75/)).toBeInTheDocument();
    });

    it('should pass opponent HP to battlefield', () => {
      useGameStore.setState({
        battlefield: {
          playerSide: {
            activeCard: null,
            hp: 100,
            maxHP: 100,
          },
          opponentSide: {
            activeCard: null,
            hp: 50,
            maxHP: 100,
          },
        },
      });

      render(<CombatSceneComponent />);
      expect(screen.getByText(/Opponent: 50/)).toBeInTheDocument();
    });

    it('should pass player hand to card hand component', () => {
      useGameStore.setState({
        cards: {
          playerHand: [
            { id: '1', name: 'Card 1', stats: { attack: 5, defense: 3 }, type: 'attack', cost: 2 },
            { id: '2', name: 'Card 2', stats: { attack: 3, defense: 5 }, type: 'defense', cost: 2 },
            { id: '3', name: 'Card 3', stats: { attack: 4, defense: 4 }, type: 'attack', cost: 3 },
          ],
          opponentHand: [],
          playerDeck: [],
          opponentDeck: [],
          selectedCardIndex: null,
          isDragging: false,
          dragPosition: null,
        },
      });

      render(<CombatSceneComponent />);
      expect(screen.getByText('Cards: 3')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should accept onVictory callback', () => {
      const callback = vi.fn();
      render(<CombatSceneComponent onVictory={callback} />);
      
      // Component should render without errors
      expect(screen.getByTestId('combat-scene')).toBeInTheDocument();
    });

    it('should accept onDefeat callback', () => {
      const callback = vi.fn();
      render(<CombatSceneComponent onDefeat={callback} />);
      
      // Component should render without errors
      expect(screen.getByTestId('combat-scene')).toBeInTheDocument();
    });

    it('should work without any props', () => {
      expect(() => render(<CombatSceneComponent />)).not.toThrow();
    });
  });
});
