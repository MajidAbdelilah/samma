import { render, screen, within } from '@testing-library/react';
import GamePerformanceTable from '@/components/Analytics/GamePerformanceTable';
import { ChakraProvider } from '@chakra-ui/react';

const mockGames = [
  {
    id: '1',
    title: 'Game 1',
    revenue: 1000,
    sales: 100,
    rating: 4.5,
    downloads: 500,
  },
  {
    id: '2',
    title: 'Game 2',
    revenue: 2000,
    sales: 200,
    rating: 4.8,
    downloads: 1000,
  },
];

describe('GamePerformanceTable', () => {
  it('renders table headers correctly', () => {
    render(
      <ChakraProvider>
        <GamePerformanceTable games={mockGames} />
      </ChakraProvider>
    );

    const tableHeader = screen.getByRole('columnheader', { name: 'الإيرادات' });
    expect(tableHeader).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'اللعبة' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'المبيعات' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'التقييم' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'التحميلات' })).toBeInTheDocument();
  });

  it('renders game data correctly', () => {
    render(
      <ChakraProvider>
        <GamePerformanceTable games={mockGames} />
      </ChakraProvider>
    );

    mockGames.forEach((game) => {
      const row = screen.getByRole('row', { name: new RegExp(game.title) });
      expect(within(row).getByText(game.title)).toBeInTheDocument();
      expect(within(row).getByText(game.rating.toFixed(1))).toBeInTheDocument();
      expect(within(row).getByText(game.downloads.toString())).toBeInTheDocument();
      expect(within(row).getByText(game.sales.toString())).toBeInTheDocument();
    });
  });
}); 