import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import AnalyticsFilters from '@/components/Analytics/AnalyticsFilters';

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

describe('AnalyticsFilters', () => {
  const mockGames = [
    { id: '1', title: 'Game 1' },
    { id: '2', title: 'Game 2' }
  ];

  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderAnalyticsFilters = () => {
    return render(
      <ChakraProvider>
        <AnalyticsFilters games={mockGames} onFilterChange={mockOnFilterChange} />
      </ChakraProvider>
    );
  };

  const selectCustomPeriod = async () => {
    const periodSelect = screen.getByLabelText(/الفترة الزمنية/i);
    await act(async () => {
      fireEvent.change(periodSelect, { target: { value: 'custom' } });
    });
  };

  const getDateInputs = () => {
    return {
      startDate: screen.getByTestId('start-date-input'),
      endDate: screen.getByTestId('end-date-input'),
      applyButton: screen.getByTestId('apply-date-filter')
    };
  };

  it('renders filter options correctly', () => {
    renderAnalyticsFilters();

    // Check period select
    const periodSelect = screen.getByLabelText(/الفترة الزمنية/i);
    expect(periodSelect).toBeInTheDocument();
    expect(screen.getByText(/اليوم/i)).toBeInTheDocument();
    expect(screen.getByText(/آخر أسبوع/i)).toBeInTheDocument();
    expect(screen.getByText(/آخر شهر/i)).toBeInTheDocument();
    expect(screen.getByText(/آخر سنة/i)).toBeInTheDocument();
    expect(screen.getByText(/فترة مخصصة/i)).toBeInTheDocument();

    // Check game select
    const gameSelect = screen.getByLabelText(/اللعبة/i);
    expect(gameSelect).toBeInTheDocument();
    expect(screen.getByText(/جميع الألعاب/i)).toBeInTheDocument();
    mockGames.forEach(game => {
      expect(screen.getByText(game.title)).toBeInTheDocument();
    });
  });

  it('shows custom period inputs when custom period is selected', async () => {
    renderAnalyticsFilters();
    await selectCustomPeriod();

    const { startDate, endDate, applyButton } = getDateInputs();
    expect(startDate).toBeInTheDocument();
    expect(endDate).toBeInTheDocument();
    expect(applyButton).toBeInTheDocument();
  });

  it('handles date input changes correctly', async () => {
    renderAnalyticsFilters();
    await selectCustomPeriod();

    const { startDate, endDate, applyButton } = getDateInputs();

    await act(async () => {
      fireEvent.change(startDate, { target: { value: '2024-01-01' } });
      fireEvent.change(endDate, { target: { value: '2024-01-31' } });
      fireEvent.click(applyButton);
    });

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        period: 'custom',
        customPeriod: {
          start: '2024-01-01',
          end: '2024-01-31'
        }
      })
    );
  });

  it('handles game selection changes', async () => {
    renderAnalyticsFilters();

    const gameSelect = screen.getByLabelText(/اللعبة/i);
    await act(async () => {
      fireEvent.change(gameSelect, { target: { value: '1' } });
    });

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        gameId: '1'
      })
    );
  });

  it('handles period selection changes', async () => {
    renderAnalyticsFilters();

    const periodSelect = screen.getByLabelText(/الفترة الزمنية/i);
    await act(async () => {
      fireEvent.change(periodSelect, { target: { value: 'week' } });
    });

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        period: 'week'
      })
    );
  });

  it('clears date inputs when switching from custom period', async () => {
    renderAnalyticsFilters();
    await selectCustomPeriod();

    const { startDate, endDate } = getDateInputs();

    await act(async () => {
      fireEvent.change(startDate, { target: { value: '2024-01-01' } });
      fireEvent.change(endDate, { target: { value: '2024-01-31' } });
    });

    const periodSelect = screen.getByLabelText(/الفترة الزمنية/i);
    await act(async () => {
      fireEvent.change(periodSelect, { target: { value: 'month' } });
    });

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        period: 'month'
      })
    );
    expect(mockOnFilterChange).toHaveBeenLastCalledWith(
      expect.not.objectContaining({
        customPeriod: expect.anything()
      })
    );
  });

  it('disables apply button when dates are invalid', async () => {
    renderAnalyticsFilters();
    await selectCustomPeriod();

    const { startDate, endDate, applyButton } = getDateInputs();

    await act(async () => {
      fireEvent.change(startDate, { target: { value: '2024-01-31' } });
      fireEvent.change(endDate, { target: { value: '2024-01-01' } });
    });

    expect(applyButton).toBeDisabled();

    await act(async () => {
      fireEvent.change(startDate, { target: { value: '2024-01-01' } });
      fireEvent.change(endDate, { target: { value: '2024-01-31' } });
    });

    expect(applyButton).not.toBeDisabled();
  });
}); 