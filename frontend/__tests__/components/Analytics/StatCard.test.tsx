import { render, screen } from '@testing-library/react';
import StatCard from '@/components/Analytics/StatCard';
import { ChakraProvider } from '@chakra-ui/react';

describe('StatCard', () => {
  it('renders label and value correctly', () => {
    render(
      <ChakraProvider>
        <StatCard label="المبيعات" value={1000} />
      </ChakraProvider>
    );

    expect(screen.getByText('المبيعات')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('formats value using provided formatter', () => {
    const formatter = (value: number) => `$${value.toFixed(2)}`;
    render(
      <ChakraProvider>
        <StatCard label="الإيرادات" value={1000} format={formatter} />
      </ChakraProvider>
    );

    expect(screen.getByText('$1000.00')).toBeInTheDocument();
  });

  it('shows change percentage when provided', () => {
    render(
      <ChakraProvider>
        <StatCard label="المبيعات" value={1000} change={15} />
      </ChakraProvider>
    );

    expect(screen.getByText('15%')).toBeInTheDocument();
  });
}); 