import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import RatingStars from '@/components/Games/RatingStars';

describe('RatingStars', () => {
  const mockProps = {
    rating: 4.5,
    totalRatings: 42,
    size: 16,
    showCount: true
  };

  const renderComponent = (props = mockProps) => {
    return render(
      <ChakraProvider>
        <RatingStars {...props} />
      </ChakraProvider>
    );
  };

  it('renders correct number of stars', () => {
    renderComponent();
    const stars = screen.getAllByTestId('star-icon');
    expect(stars).toHaveLength(5);
  });

  it('displays total ratings correctly', () => {
    renderComponent();
    expect(screen.getByText('(42 ratings)')).toBeInTheDocument();
  });

  it('renders full and half stars correctly for rating 4.5', () => {
    renderComponent();
    const stars = screen.getAllByTestId('star-icon');
    
    // Should show 4 full stars, 1 half star for rating 4.5
    const fullStars = stars.slice(0, 4);
    const halfStar = stars[4];
    
    fullStars.forEach(star => {
      expect(star).toHaveAttribute('data-testid', 'star-icon');
      expect(star).toHaveAttribute('aria-label', 'full star');
    });
    
    expect(halfStar).toHaveAttribute('data-testid', 'star-icon');
    expect(halfStar).toHaveAttribute('aria-label', 'half star');
  });

  it('shows singular rating text when totalRatings is 1', () => {
    renderComponent({ ...mockProps, totalRatings: 1 });
    expect(screen.getByText('(1 rating)')).toBeInTheDocument();
  });

  it('hides rating count when showCount is false', () => {
    renderComponent({ ...mockProps, showCount: false });
    expect(screen.queryByText(/\(\d+ ratings?\)/)).not.toBeInTheDocument();
  });

  it('uses custom size when provided', () => {
    const customSize = 24;
    renderComponent({ ...mockProps, size: customSize });
    const stars = screen.getAllByTestId('star-icon');
    
    stars.forEach(star => {
      expect(star).toHaveStyle({
        width: `${customSize}px`,
        height: `${customSize}px`
      });
    });
  });
}); 