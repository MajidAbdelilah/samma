import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { createApi } from '../../utils/api';
import GameList from '../../components/Games/GameList';
import { Game } from '../../types';

// Mock the API
jest.mock('../../utils/api');

const mockGames: Game[] = [
  {
    id: 1,
    title: 'Test Game 1',
    slug: 'test-game-1',
    description: 'Test description 1',
    price: 9.99,
    rating: 4.5,
    total_ratings: 10,
    seller: {
      id: 1,
      username: 'seller1',
      email: 'seller1@example.com'
    },
    category: {
      id: 1,
      name: 'Action',
      slug: 'action'
    },
    thumbnail: '/test-image-1.jpg',
    created_at: '2024-02-09T12:00:00Z'
  },
  {
    id: 2,
    title: 'Test Game 2',
    slug: 'test-game-2',
    description: 'Test description 2',
    price: 19.99,
    rating: 4.0,
    total_ratings: 5,
    seller: {
      id: 2,
      username: 'seller2',
      email: 'seller2@example.com'
    },
    category: {
      id: 1,
      name: 'RPG',
      slug: 'rpg'
    },
    thumbnail: '/test-image-2.jpg',
    created_at: '2024-02-09T13:00:00Z'
  }
];

describe('GameList Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the API response for games and categories
    (createApi as jest.Mock).mockImplementation(() => ({
      get: jest.fn().mockImplementation((url: string) => {
        if (url.includes('/categories')) {
          return Promise.resolve({
            data: {
              results: [
                { id: 1, name: 'Action', slug: 'action' },
                { id: 2, name: 'RPG', slug: 'rpg' }
              ]
            }
          });
        }
        if (url.includes('/games')) {
          return Promise.resolve({
            data: {
              results: mockGames,
              next: null
            }
          });
        }
        throw new Error('Failed to fetch games');
      })
    }));
  });

  it('renders game list correctly', async () => {
    render(
      <ChakraProvider>
        <GameList />
      </ChakraProvider>
    );

    // Wait for games to load
    await waitFor(() => {
      expect(screen.getByText('Test Game 1')).toBeInTheDocument();
      expect(screen.getByText('Test Game 2')).toBeInTheDocument();
    });

    // Check if prices are displayed
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();

    // Check if ratings are displayed
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('4.0')).toBeInTheDocument();

    // Check if categories are displayed
    // Check category options in the select
    const categorySelect = screen.getByLabelText(/category/i);
    expect(categorySelect).toHaveValue('all');
    
    // Check if the category badges are displayed
    const badges = screen.getAllByText(/(Action|RPG)/i);
    expect(badges.some(badge => badge.textContent === 'Action')).toBe(true);
    expect(badges.some(badge => badge.textContent === 'RPG')).toBe(true);
  });

  it('handles loading state correctly', async () => {
    jest.setTimeout(10000);
    jest.useFakeTimers();
    // Mock a delayed API response
    (createApi as jest.Mock).mockImplementation(() => ({
      get: jest.fn().mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({ data: mockGames }), 100);
      }))
    }));

    render(
      <ChakraProvider>
        <GameList />
      </ChakraProvider>
    );

    // Wait for content to load and loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Verify games are displayed
    jest.runAllTimers();
    await waitFor(() => {
      const gameCards = screen.getAllByRole('listitem');
      expect(gameCards).toHaveLength(2);
      expect(gameCards[0]).toHaveTextContent('Test Game 1');
      expect(gameCards[1]).toHaveTextContent('Test Game 2');
    }, { timeout: 10000 });
  });

  it('handles error state correctly', async () => {
    // Mock an API error
    (createApi as jest.Mock).mockImplementation(() => ({
      get: jest.fn().mockRejectedValue(new Error('Failed to fetch games'))
    }));

    render(
      <ChakraProvider>
        <GameList />
      </ChakraProvider>
    );

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch games')).toBeInTheDocument();
    });
  });

  it('handles game filtering correctly', async () => {
    render(
      <ChakraProvider>
        <GameList />
      </ChakraProvider>
    );

    // Wait for games to load
    await waitFor(() => {
      expect(screen.getByText('Test Game 1')).toBeInTheDocument();
    });

    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Filter by category
    const categoryFilter = screen.getByLabelText('Category');
    fireEvent.change(categoryFilter, { target: { value: 'action' } });

    // Check if only Action games are shown
    const gameCards = screen.getAllByTestId('game-card');
    expect(gameCards).toHaveLength(1);
    expect(gameCards[0]).toHaveTextContent('Test Game 1');
    expect(gameCards[0]).toHaveTextContent('Action');
  });

  it('handles game sorting correctly', async () => {
    render(
      <ChakraProvider>
        <GameList />
      </ChakraProvider>
    );

    // Wait for games to load
    await waitFor(() => {
      expect(screen.getByText('Test Game 1')).toBeInTheDocument();
    });

    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Sort by price
    const sortSelect = screen.getByLabelText('Sort by');
    fireEvent.change(sortSelect, { target: { value: 'price' } });

    // Check if games are sorted by price
    const gameCards = screen.getAllByTestId('game-card');
    expect(gameCards).toHaveLength(2);
    expect(gameCards[0]).toHaveTextContent('$9.99');
    expect(gameCards[1]).toHaveTextContent('$19.99');
  });
}); 