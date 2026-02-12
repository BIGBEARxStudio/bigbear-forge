import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardComponent } from './CardComponent';
import { Card } from '../types';

const mockCard: Card = {
  id: 'card_001',
  name: 'Test Card',
  type: 'attack',
  rarity: 'common',
  stats: {
    attack: 5,
    defense: 3,
    speed: 7,
  },
  artwork: '/test.png',
};

describe('CardComponent', () => {
  it('should render card with name and stats', () => {
    render(<CardComponent card={mockCard} />);

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // attack
    expect(screen.getByText('3')).toBeInTheDocument(); // defense
    expect(screen.getByText('7')).toBeInTheDocument(); // speed
  });

  it('should display card type', () => {
    render(<CardComponent card={mockCard} />);

    expect(screen.getByText('attack')).toBeInTheDocument();
  });

  it('should display card rarity', () => {
    render(<CardComponent card={mockCard} />);

    expect(screen.getByText('common')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<CardComponent card={mockCard} onSelect={onSelect} />);

    const card = screen.getByTestId('card-component');
    fireEvent.click(card);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onHover when mouse enters', () => {
    const onHover = vi.fn();
    render(<CardComponent card={mockCard} onHover={onHover} />);

    const card = screen.getByTestId('card-component');
    fireEvent.mouseEnter(card);

    expect(onHover).toHaveBeenCalledWith(true);
  });

  it('should call onHover when mouse leaves', () => {
    const onHover = vi.fn();
    render(<CardComponent card={mockCard} onHover={onHover} />);

    const card = screen.getByTestId('card-component');
    fireEvent.mouseLeave(card);

    expect(onHover).toHaveBeenCalledWith(false);
  });

  it('should call onDragStart when drag starts', () => {
    const onDragStart = vi.fn();
    render(<CardComponent card={mockCard} onDragStart={onDragStart} />);

    const card = screen.getByTestId('card-component');
    fireEvent.dragStart(card);

    expect(onDragStart).toHaveBeenCalledTimes(1);
  });

  it('should call onDragEnd when drag ends', () => {
    const onDragEnd = vi.fn();
    render(<CardComponent card={mockCard} onDragEnd={onDragEnd} />);

    const card = screen.getByTestId('card-component');
    fireEvent.dragEnd(card);

    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('should apply selected styling when isSelected is true', () => {
    const { container } = render(
      <CardComponent card={mockCard} isSelected={true} />
    );

    const card = container.querySelector('.card');
    expect(card).toHaveStyle({ border: '2px solid #4CAF50' });
  });

  it('should apply default styling when isSelected is false', () => {
    const { container } = render(
      <CardComponent card={mockCard} isSelected={false} />
    );

    const card = container.querySelector('.card');
    expect(card).toHaveStyle({ border: '2px solid #444' });
  });

  it('should apply dragging opacity when isDragging is true', () => {
    const { container } = render(
      <CardComponent card={mockCard} isDragging={true} />
    );

    const card = container.querySelector('.card');
    expect(card).toHaveStyle({ opacity: 0.5 });
  });

  it('should render with custom className', () => {
    const { container } = render(
      <CardComponent card={mockCard} className="custom-class" />
    );

    const card = container.querySelector('.card.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('should render with custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<CardComponent card={mockCard} style={customStyle} />);

    const card = screen.getByTestId('card-component');
    expect(card).toBeInTheDocument();
    // Style is applied but merged with default styles
  });

  it('should display correct rarity color for legendary', () => {
    const legendaryCard = { ...mockCard, rarity: 'legendary' as const };
    render(<CardComponent card={legendaryCard} />);

    const rarityText = screen.getByText('legendary');
    expect(rarityText).toHaveStyle({ color: '#FFD700' });
  });

  it('should display correct rarity color for epic', () => {
    const epicCard = { ...mockCard, rarity: 'epic' as const };
    render(<CardComponent card={epicCard} />);

    const rarityText = screen.getByText('epic');
    expect(rarityText).toHaveStyle({ color: '#9C27B0' });
  });

  it('should display correct rarity color for rare', () => {
    const rareCard = { ...mockCard, rarity: 'rare' as const };
    render(<CardComponent card={rareCard} />);

    const rarityText = screen.getByText('rare');
    expect(rarityText).toHaveStyle({ color: '#2196F3' });
  });

  it('should have data-card-id attribute', () => {
    render(<CardComponent card={mockCard} />);

    const card = screen.getByTestId('card-component');
    expect(card).toHaveAttribute('data-card-id', 'card_001');
  });

  it('should be draggable', () => {
    render(<CardComponent card={mockCard} />);

    const card = screen.getByTestId('card-component');
    expect(card).toHaveAttribute('draggable', 'true');
  });
});
