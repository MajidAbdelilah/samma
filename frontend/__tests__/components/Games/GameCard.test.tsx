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
    id: 123,
    title: 'Test Game',
    slug: 'test-game',
    description: 'A test game description',
    price: 29.99,
    rating: 4.5,
    total_ratings: 42,
    thumbnail: '/images/test-game.jpg',
    category: {
      id: 1,
      name: 'Action',
      slug: 'action'
    },
    seller: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    },
    created_at: '2025-02-10T18:00:00Z'
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
    expect(screen.getByText(mockGame.rating.toFixed(1))).toBeInTheDocument();
    expect(screen.getByText(`(${mockGame.total_ratings})`)).toBeInTheDocument();
    expect(screen.getByText(`$${mockGame.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(mockGame.category.name)).toBeInTheDocument();
    expect(screen.getByText(`By ${mockGame.seller.username}`)).toBeInTheDocument();
  });

  it('displays game category', () => {
    render(
      <ChakraProvider>
        <GameCard game={mockGame} />
      </ChakraProvider>
    );
    expect(screen.getByText(mockGame.category.name)).toBeInTheDocument();
  });

  it('links to game details page', () => {
    render(
      <ChakraProvider>
        <GameCard game={mockGame} />
      </ChakraProvider>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/games/${mockGame.slug}`);
  });

  it('displays game thumbnail', () => {
    render(
      <ChakraProvider>
        <GameCard game={mockGame} />
      </ChakraProvider>
    );

    const thumbnail = screen.getByRole('img');
    expect(thumbnail).toHaveAttribute('src', mockGame.thumbnail);
    expect(thumbnail).toHaveAttribute('alt', mockGame.title);
  });

  it('shows seller name', () => {
    render(
      <ChakraProvider>
        <GameCard game={mockGame} />
      </ChakraProvider>
    );

    expect(screen.getByText(`By ${mockGame.seller.username}`)).toBeInTheDocument();
  });

  it('handles missing thumbnail gracefully', () => {
    const gameWithoutThumbnail = { ...mockGame, thumbnail: '' };
    render(
      <ChakraProvider>
        <GameCard game={gameWithoutThumbnail} />
      </ChakraProvider>
    );

    const fallbackImage = screen.getByRole('img');
    expect(fallbackImage).toHaveAttribute('src', '/images/default-game-thumbnail.svg');
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