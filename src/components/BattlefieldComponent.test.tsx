import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BattlefieldComponent } from './BattlefieldComponent';
import { Card } from '../types';

const mockPlayerCard: Card = {
  id: 'player_card',
  name: 'Player Card',
  type: 'attack',
  rarity: 'common',
  stats: { attack: 5, defense: 3, speed: 7 },
  artwork: '/player.png',
};

const mockOpponentCard: Card = {
  id: 'opponent_card',
  name: 'Opponent Card',
  type: 'defense',
  rarity: 'rare',
  stats: { attack: 3, defense: 8, speed: 4 },
  artwork: '/opponent.png',
};

describe('BattlefieldComponent', () => {
  it('should render battlefield container', () => {
    render(
      <BattlefieldComponent
        playerCard={null}
        opponentCard={null}
        playerHP={100}
        playerMaxHP={100}
        opponentHP={100}
        opponentMaxHP={100}
      />
    );

    expect(screen.getByTestId('battlefield')).toBeInTheDocument();
  });

  it('should display player HP', () => {
    render(
      <BattlefieldComponent
        playerCard={null}
        opponentCard={null}
        playerHP={80}
        playerMaxHP={100}
        opponentHP={100}
        opponentMaxHP={100}
      />
    );

    expect(screen.getByText('80 / 100')).toBeInTheDocument();
  });

  it('should display opponent HP', () => {
    render(
      <BattlefieldComponent
        playerCard={null}
        opponentCard={null}
        playerHP={100}
        playerMaxHP={100}
        opponentHP={60}
        opponentMaxHP={100}
      />
    );

    expect(screen.getByText('60 / 100')).toBeInTheDocument();
  });

  it('should display player card when present', () => {
    render(
      <BattlefieldComponent
        playerCard={mockPlayerCard}
        opponentCard={null}
        playerHP={100}
        playerMaxHP={100}
        opponentHP={100}
        opponentMaxHP={100}
      />
    );

    expect(screen.getByText('Player Card')).toBeInTheDocument();
    expect(screen.getByText(/⚔️ 5/)).toBeInTheDocument();
    expect(screen.getByText(/🛡️ 3/)).toBeInTheDocument();
  });

  it('should display opponent card when present', () => {
    render(
      <BattlefieldComponent
        playerCard={null}
        opponentCard={mockOpponentCard}
        playerHP={100}
        playerMaxHP={100}
        opponentHP={100}
        opponentMaxHP={100}
      />
    );

    expect(screen.getByText('Opponent Card')).toBeInTheDocument();
    expect(screen.getByText(/⚔️ 3/)).toBeInTheDocument();
    expect(screen.getByText(/🛡️ 8/)).toBeInTheDocument();
  });

  it('should display both cards when present', () => {
    render(
      <BattlefieldComponent
        playerCard={mockPlayerCard}
        opponentCard={mockOpponentCard}
        playerHP={100}
        playerMaxHP={100}
        opponentHP={100}
        opponentMaxHP={100}
      />
    );

    expect(screen.getByText('Player Card')).toBeInTheDocument();
    expect(screen.getByText('Opponent Card')).toBeInTheDocument();
  });

  it('should display VS divider', () => {
    render(
      <BattlefieldComponent
        playerCard={null}
        opponentCard={null}
        playerHP={100}
        playerMaxHP={100}
        opponentHP={100}
        opponentMaxHP={100}
      />
    );

    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('should display damage numbers', () => {
    const damageNumbers = [
      { id: 'dmg1', value: 10, x: 50, y: 30 },
      { id: 'dmg2', value: 5, x: 50, y: 70 },
    ];

    render(
      <BattlefieldComponent
        playerCard={null}
        opponentCard={null}
        playerHP={100}
        playerMaxHP={100}
        opponentHP={100}
        opponentMaxHP={100}
        damageNumbers={damageNumbers}
      />
    );

    expect(screen.getByText('-10')).toBeInTheDocument();
    expect(screen.getByText('-5')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <BattlefieldComponent
        playerCard={null}
        opponentCard={null}
        playerHP={100}
        playerMaxHP={100}
        opponentHP={100}
        opponentMaxHP={100}
        className="custom-battlefield"
      />
    );

    const battlefield = container.querySelector('.battlefield.custom-battlefield');
    expect(battlefield).toBeInTheDocument();
  });

  it('should handle zero HP', () => {
    render(
      <BattlefieldComponent
        playerCard={null}
        opponentCard={null}
        playerHP={0}
        playerMaxHP={100}
        opponentHP={0}
        opponentMaxHP={100}
      />
    );

    const hpTexts = screen.getAllByText('0 / 100');
    expect(hpTexts).toHaveLength(2); // Both player and opponent
  });

  it('should handle different max HP values', () => {
    render(
      <BattlefieldComponent
        playerCard={null}
        opponentCard={null}
        playerHP={75}
        playerMaxHP={150}
        opponentHP={50}
        opponentMaxHP={80}
      />
    );

    expect(screen.getByText('75 / 150')).toBeInTheDocument();
    expect(screen.getByText('50 / 80')).toBeInTheDocument();
  });

  it('should display Player label', () => {
    render(
      <BattlefieldComponent
        playerCard={null}
        opponentCard={null}
        playerHP={100}
        playerMaxHP={100}
        opponentHP={100}
        opponentMaxHP={100}
      />
    );

    expect(screen.getByText('Player')).toBeInTheDocument();
  });

  it('should display Opponent label', () => {
    render(
      <BattlefieldComponent
        playerCard={null}
        opponentCard={null}
        playerHP={100}
        playerMaxHP={100}
        opponentHP={100}
        opponentMaxHP={100}
      />
    );

    expect(screen.getByText('Opponent')).toBeInTheDocument();
  });

  it('should handle empty damage numbers array', () => {
    render(
      <BattlefieldComponent
        playerCard={null}
        opponentCard={null}
        playerHP={100}
        playerMaxHP={100}
        opponentHP={100}
        opponentMaxHP={100}
        damageNumbers={[]}
      />
    );

    expect(screen.queryByText(/-\d+/)).not.toBeInTheDocument();
  });
});
