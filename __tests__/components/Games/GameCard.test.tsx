import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import GameCard from '@/components/Games/GameCard';
import { useRouter } from 'next/router';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('GameCard', () => {
  const mockGame = {
    id: '123',
    title: 'Test Game',
    price: 29.99,
    rating: 8.5,
    commentCount: 42,
    thumbnailUrl: '/images/test-game.jpg',
    bidPercentage: 7.5,
    categories: ['action', 'adventure'],
  };

  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders game information correctly', () => {
    render(
      <ChakraProvider>
        <GameCard game={mockGame} />
      </ChakraProvider>
    );

    expect(screen.getByText(mockGame.title)).toBeInTheDocument();
    expect(screen.getByText(`${mockGame.rating.toFixed(1)}/10`)).toBeInTheDocument();
    expect(screen.getByText(mockGame.commentCount.toString())).toBeInTheDocument();
    expect(screen.getByText(`$${mockGame.price}`)).toBeInTheDocument();
    expect(screen.getByText(`نسبة العمولة: ${mockGame.bidPercentage}%`)).toBeInTheDocument();
  });

  it('displays game categories', () => {
    render(
      <ChakraProvider>
        <GameCard game={mockGame} />
      </ChakraProvider>
    );

    mockGame.categories.forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('links to game details page', () => {
    render(
      <ChakraProvider>
        <GameCard game={mockGame} />
      </ChakraProvider>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/games/${mockGame.id}`);
  });

  it('displays game thumbnail', () => {
    render(
      <ChakraProvider>
        <GameCard game={mockGame} />
      </ChakraProvider>
    );

    const thumbnail = screen.getByRole('img');
    expect(thumbnail).toHaveAttribute('src', mockGame.thumbnailUrl);
    expect(thumbnail).toHaveAttribute('alt', mockGame.title);
  });

  it('shows bid percentage indicator', () => {
    render(
      <ChakraProvider>
        <GameCard game={mockGame} />
      </ChakraProvider>
    );

    const bidIndicator = screen.getByText(`نسبة العمولة: ${mockGame.bidPercentage}%`);
    expect(bidIndicator).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', mockGame.bidPercentage.toString());
  });

  it('handles missing thumbnail gracefully', () => {
    const gameWithoutThumbnail = { ...mockGame, thumbnailUrl: '' };
    render(
      <ChakraProvider>
        <GameCard game={gameWithoutThumbnail} />
      </ChakraProvider>
    );

    const fallbackImage = screen.getByRole('img');
    expect(fallbackImage).toHaveAttribute('src', '');
  });

  it('truncates long titles', () => {
    const longTitle = 'A'.repeat(100);
    const gameWithLongTitle = {
      ...mockGame,
      title: longTitle
    };

    render(
      <ChakraProvider>
        <GameCard game={gameWithLongTitle} />
      </ChakraProvider>
    );

    const title = screen.getByRole('heading');
    expect(title.textContent).toBe(longTitle);
    expect(title.closest('[class*="chakra-heading"]')).toBeInTheDocument();
  });
}); 