import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardHandComponent } from './CardHandComponent';
import { Card } from '../types';

const mockCards: Card[] = [
  {
    id: 'card_001',
    name: 'Card 1',
    type: 'attack',
    rarity: 'common',
    stats: { attack: 5, defense: 3, speed: 7 },
    artwork: '/test1.png',
  },
  {
    id: 'card_002',
    name: 'Card 2',
    type: 'defense',
    rarity: 'rare',
    stats: { attack: 2, defense: 8, speed: 4 },
    artwork: '/test2.png',
  },
  {
    id: 'card_003',
    name: 'Card 3',
    type: 'special',
    rarity: 'epic',
    stats: { attack: 7, defense: 5, speed: 6 },
    artwork: '/test3.png',
  },
];

describe('CardHandComponent', () => {
  it('should render all cards in hand', () => {
    render(
      <CardHandComponent
        cards={mockCards}
        selectedIndex={null}
        onCardSelect={vi.fn()}
        onCardPlay={vi.fn()}
      />
    );

    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
    expect(screen.getByText('Card 3')).toBeInTheDocument();
  });

  it('should display empty state when no cards', () => {
    render(
      <CardHandComponent
        cards={[]}
        selectedIndex={null}
        onCardSelect={vi.fn()}
        onCardPlay={vi.fn()}
      />
    );

    expect(screen.getByText('No cards in hand')).toBeInTheDocument();
  });

  it('should call onCardSelect when card is clicked once', () => {
    const onCardSelect = vi.fn();
    render(
      <CardHandComponent
        cards={mockCards}
        selectedIndex={null}
        onCardSelect={onCardSelect}
        onCardPlay={vi.fn()}
      />
    );

    const cards = screen.getAllByTestId('card-component');
    fireEvent.click(cards[0]);

    expect(onCardSelect).toHaveBeenCalledWith(0);
  });

  it('should call onCardPlay when selected card is clicked again', () => {
    const onCardPlay = vi.fn();
    render(
      <CardHandComponent
        cards={mockCards}
        selectedIndex={0}
        onCardSelect={vi.fn()}
        onCardPlay={onCardPlay}
      />
    );

    const cards = screen.getAllByTestId('card-component');
    fireEvent.click(cards[0]);

    expect(onCardPlay).toHaveBeenCalledWith(0);
  });

  it('should display hand size indicator', () => {
    render(
      <CardHandComponent
        cards={mockCards}
        selectedIndex={null}
        onCardSelect={vi.fn()}
        onCardPlay={vi.fn()}
        maxCards={5}
      />
    );

    expect(screen.getByText('3 / 5')).toBeInTheDocument();
  });

  it('should use custom maxCards value', () => {
    render(
      <CardHandComponent
        cards={mockCards}
        selectedIndex={null}
        onCardSelect={vi.fn()}
        onCardPlay={vi.fn()}
        maxCards={7}
      />
    );

    expect(screen.getByText('3 / 7')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <CardHandComponent
        cards={mockCards}
        selectedIndex={null}
        onCardSelect={vi.fn()}
        onCardPlay={vi.fn()}
        className="custom-hand"
      />
    );

    const hand = container.querySelector('.card-hand.custom-hand');
    expect(hand).toBeInTheDocument();
  });

  it('should handle drag start on card', () => {
    const onCardSelect = vi.fn();
    render(
      <CardHandComponent
        cards={mockCards}
        selectedIndex={null}
        onCardSelect={onCardSelect}
        onCardPlay={vi.fn()}
      />
    );

    const cards = screen.getAllByTestId('card-component');
    fireEvent.dragStart(cards[1]);

    expect(onCardSelect).toHaveBeenCalledWith(1);
  });

  it('should handle drag end and play card', () => {
    const onCardPlay = vi.fn();
    render(
      <CardHandComponent
        cards={mockCards}
        selectedIndex={1}
        onCardSelect={vi.fn()}
        onCardPlay={onCardPlay}
      />
    );

    const cards = screen.getAllByTestId('card-component');
    fireEvent.dragEnd(cards[1]);

    expect(onCardPlay).toHaveBeenCalledWith(1);
  });

  it('should not play card on drag end if not selected', () => {
    const onCardPlay = vi.fn();
    render(
      <CardHandComponent
        cards={mockCards}
        selectedIndex={0}
        onCardSelect={vi.fn()}
        onCardPlay={onCardPlay}
      />
    );

    const cards = screen.getAllByTestId('card-component');
    fireEvent.dragEnd(cards[1]);

    expect(onCardPlay).not.toHaveBeenCalled();
  });

  it('should render correct number of cards', () => {
    render(
      <CardHandComponent
        cards={mockCards}
        selectedIndex={null}
        onCardSelect={vi.fn()}
        onCardPlay={vi.fn()}
      />
    );

    const cards = screen.getAllByTestId('card-component');
    expect(cards).toHaveLength(3);
  });

  it('should handle single card in hand', () => {
    render(
      <CardHandComponent
        cards={[mockCards[0]]}
        selectedIndex={null}
        onCardSelect={vi.fn()}
        onCardPlay={vi.fn()}
      />
    );

    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
  });

  it('should handle full hand', () => {
    const fullHand = [
      ...mockCards,
      { ...mockCards[0], id: 'card_004', name: 'Card 4' },
      { ...mockCards[0], id: 'card_005', name: 'Card 5' },
    ];

    render(
      <CardHandComponent
        cards={fullHand}
        selectedIndex={null}
        onCardSelect={vi.fn()}
        onCardPlay={vi.fn()}
        maxCards={5}
      />
    );

    expect(screen.getByText('5 / 5')).toBeInTheDocument();
  });
});
