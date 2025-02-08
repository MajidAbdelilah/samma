import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import GameFilters from '@/components/Games/GameFilters';
import { act } from 'react';

// Mock Chakra UI's Collapse component to remove animation
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    Collapse: ({ children, in: isOpen }: { children: React.ReactNode; in: boolean }) => (
      <div data-testid="collapse" style={{ display: isOpen ? 'block' : 'none' }}>
        {children}
      </div>
    ),
  };
});

describe('GameFilters', () => {
  const mockCategories = [
    { id: '1', name: 'Action', slug: 'action' },
    { id: '2', name: 'Adventure', slug: 'adventure' },
    { id: '3', name: 'RPG', slug: 'rpg' }
  ];

  const mockTags = [
    { id: '1', name: 'Multiplayer', slug: 'multiplayer' },
    { id: '2', name: 'Single Player', slug: 'single-player' },
    { id: '3', name: 'Co-op', slug: 'co-op' }
  ];

  const mockOnFiltersChange = jest.fn();

  const defaultFilters = {
    searchTerm: '',
    category: 'all',
    selectedTags: [],
    priceRange: [0, 1000] as [number, number],
    sortBy: 'relevance'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <ChakraProvider>
        <GameFilters
          categories={[{ id: '1', name: 'Category 1', slug: 'category-1' }]}
          tags={[
            { id: '1', name: 'Tag 1', slug: 'tag-1' }, 
            { id: '3', name: 'Tag 3', slug: 'tag-3' }
          ]}
          onFiltersChange={mockOnFiltersChange}
          filters={defaultFilters}
        />
      </ChakraProvider>
    );
  };

  it('renders filter options correctly', () => {
    renderComponent();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-options-button')).toBeInTheDocument();
  });

  it('toggles advanced options panel', async () => {
    renderComponent();
    
    // Initially, advanced options should not be visible
    const collapse = screen.getByTestId('collapse');
    expect(collapse).toHaveStyle({ display: 'none' });
    
    // Open advanced options
    const advancedOptionsButton = screen.getByTestId('advanced-options-button');
    await act(async () => {
      fireEvent.click(advancedOptionsButton);
    });

    // Advanced options should now be visible
    expect(collapse).toHaveStyle({ display: 'block' });

    // Close advanced options
    await act(async () => {
      fireEvent.click(advancedOptionsButton);
    });

    // Advanced options should not be visible again
    expect(collapse).toHaveStyle({ display: 'none' });
  });

  it('handles search term changes', async () => {
    renderComponent();
    const searchInput = screen.getByTestId('search-input');
    
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test' } });
    });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      searchTerm: 'test'
    });
  });

  it('handles price range changes', async () => {
    const updatedFilters = {
      ...defaultFilters,
      priceRange: [100, 1000] as [number, number]
    };

    render(
      <ChakraProvider>
        <GameFilters
          categories={[{ id: '1', name: 'Category 1', slug: 'category-1' }]}
          tags={[
            { id: '1', name: 'Tag 1', slug: 'tag-1' }, 
            { id: '3', name: 'Tag 3', slug: 'tag-3' }
          ]}
          onFiltersChange={mockOnFiltersChange}
          filters={updatedFilters}
        />
      </ChakraProvider>
    );
    
    // Open advanced options
    const advancedOptionsButton = screen.getByTestId('advanced-options-button');
    await act(async () => {
      fireEvent.click(advancedOptionsButton);
    });

    // Verify that the price range text shows the updated values
    const priceText = screen.getByText('100$ - 1000$');
    expect(priceText).toBeInTheDocument();
  });

  it('handles category selection', async () => {
    renderComponent();
    
    // Open advanced options
    const advancedOptionsButton = screen.getByTestId('advanced-options-button');
    await act(async () => {
      fireEvent.click(advancedOptionsButton);
    });

    const categoryCheckbox = screen.getByTestId('category-1');
    await act(async () => {
      fireEvent.click(categoryCheckbox);
    });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      category: '1'
    });
  });

  it('handles tag selection', async () => {
    const initialFilters = {
      ...defaultFilters,
      selectedTags: ['1']
    };

    render(
      <ChakraProvider>
        <GameFilters
          categories={[{ id: '1', name: 'Category 1', slug: 'category-1' }]}
          tags={[
            { id: '1', name: 'Tag 1', slug: 'tag-1' }, 
            { id: '3', name: 'Tag 3', slug: 'tag-3' }
          ]}
          onFiltersChange={mockOnFiltersChange}
          filters={initialFilters}
        />
      </ChakraProvider>
    );
    
    // Open advanced options
    const advancedOptionsButton = screen.getByTestId('advanced-options-button');
    await act(async () => {
      fireEvent.click(advancedOptionsButton);
    });

    // Select second tag
    const tag3 = screen.getByTestId('tag-3');
    await act(async () => {
      fireEvent.click(tag3);
    });

    // Verify both tags are selected
    const lastCall = mockOnFiltersChange.mock.calls[mockOnFiltersChange.mock.calls.length - 1][0];
    expect(lastCall.selectedTags).toEqual(['1', '3']);
  });

  it('handles empty category and tag arrays gracefully', () => {
    render(
      <ChakraProvider>
        <GameFilters
          categories={[]}
          tags={[]}
          onFiltersChange={mockOnFiltersChange}
          filters={defaultFilters}
        />
      </ChakraProvider>
    );

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });
}); 