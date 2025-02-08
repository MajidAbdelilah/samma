import { render } from '@testing-library/react';
import RevenueBreakdownChart from '@/components/Analytics/RevenueBreakdownChart';
import { ChakraProvider } from '@chakra-ui/react';

// Mock Chart.js to avoid canvas rendering issues in tests
jest.mock('react-chartjs-2', () => ({
  Doughnut: () => null,
}));

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

describe('RevenueBreakdownChart', () => {
  it('renders without crashing', () => {
    expect(() =>
      render(
        <ChakraProvider>
          <RevenueBreakdownChart games={mockGames} />
        </ChakraProvider>
      )
    ).not.toThrow();
  });
}); 