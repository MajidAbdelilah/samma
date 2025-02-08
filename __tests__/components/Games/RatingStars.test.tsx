import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import RatingStars from '@/components/Games/RatingStars';
import { AuthContext } from '@/hooks/useAuth';

// Define User type
interface User {
  id: string;
  username: string;
  name: string;
  email: string;
}

// Define AuthContextType
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
}

// Mock auth state
const mockAuthState: AuthContextType = {
  isAuthenticated: true,
  user: {
    id: '1',
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com'
  },
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn();

describe('RatingStars', () => {
  const mockProps = {
    gameId: '123',
    currentRating: 4.5,
    onRatingChange: jest.fn(),
    isInteractive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  const renderWithProviders = (ui: React.ReactElement, authState = mockAuthState) => {
    return render(
      <ChakraProvider>
        <AuthContext.Provider value={authState}>
          {ui}
        </AuthContext.Provider>
      </ChakraProvider>
    );
  };

  it('renders correct number of stars', () => {
    renderWithProviders(<RatingStars {...mockProps} />);

    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(10);
  });

  it('displays current rating correctly', () => {
    renderWithProviders(<RatingStars {...mockProps} />);

    expect(screen.getByText('4.5/10')).toBeInTheDocument();
  });

  it('handles star hover correctly', () => {
    renderWithProviders(<RatingStars {...mockProps} />);

    const stars = screen.getAllByRole('button');
    fireEvent.mouseEnter(stars[2]); // Hover on 3rd star

    // Check if first 3 stars are filled (yellow)
    const starIcons = screen.getAllByRole('button').map(button => 
      button.querySelector('svg')
    );
    
    expect(starIcons[0]).toHaveStyle({ color: 'var(--chakra-colors-yellow-400)' });
    expect(starIcons[1]).toHaveStyle({ color: 'var(--chakra-colors-yellow-400)' });
    expect(starIcons[2]).toHaveStyle({ color: 'var(--chakra-colors-yellow-400)' });
    expect(starIcons[3]).toHaveStyle({ color: 'var(--chakra-colors-gray-300)' });
  });

  it('submits rating when authenticated', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ rating: 7 }),
    });

    renderWithProviders(<RatingStars {...mockProps} />);

    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[6]); // Click 7th star

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/games/123/rate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ rating: 7 }),
        })
      );
    });

    expect(mockProps.onRatingChange).toHaveBeenCalledWith(7);
  });

  it('shows warning toast when not authenticated', async () => {
    const unauthenticatedState = {
      ...mockAuthState,
      isAuthenticated: false,
      user: null,
    };

    renderWithProviders(<RatingStars {...mockProps} />, unauthenticatedState);

    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[4]); // Click 5th star

    await waitFor(() => {
      expect(screen.getByText('يجب تسجيل الدخول للتقييم')).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockProps.onRatingChange).not.toHaveBeenCalled();
  });

  it('handles API error correctly', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    renderWithProviders(<RatingStars {...mockProps} />);

    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[3]); // Click 4th star

    await waitFor(() => {
      expect(screen.getByText('فشل حفظ التقييم')).toBeInTheDocument();
    });

    expect(mockProps.onRatingChange).not.toHaveBeenCalled();
  });

  it('disables interaction when isInteractive is false', () => {
    renderWithProviders(<RatingStars {...mockProps} isInteractive={false} />);

    const stars = screen.getAllByRole('button');
    stars.forEach(star => {
      expect(star).toBeDisabled();
    });
  });
}); 