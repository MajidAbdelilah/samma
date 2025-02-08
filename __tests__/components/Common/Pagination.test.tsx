import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Pagination from '@/components/Common/Pagination';

describe('Pagination', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders basic pagination correctly', () => {
    render(
      <ChakraProvider>
        <Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />
      </ChakraProvider>
    );

    // Should show pages around current page
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('handles next and previous navigation', () => {
    render(
      <ChakraProvider>
        <Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('التالي'));
    expect(mockOnPageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByText('السابق'));
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('disables previous button on first page', () => {
    render(
      <ChakraProvider>
        <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
      </ChakraProvider>
    );

    const prevButton = screen.getByText('السابق').closest('button');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <ChakraProvider>
        <Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />
      </ChakraProvider>
    );

    const nextButton = screen.getByText('التالي').closest('button');
    expect(nextButton).toBeDisabled();
  });

  it('shows correct page range for middle pages', () => {
    render(
      <ChakraProvider>
        <Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />
      </ChakraProvider>
    );

    // Should show first page, ellipsis, pages around current page, and last page
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getAllByText('...').length).toBe(2);
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('highlights current page', () => {
    render(
      <ChakraProvider>
        <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
      </ChakraProvider>
    );

    const currentPageButton = screen.getByText('3').closest('button');
    expect(currentPageButton).toHaveClass('chakra-button', 'css-10x1sl7');
  });

  it('handles direct page selection', () => {
    render(
      <ChakraProvider>
        <Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('3'));
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('handles single page case', () => {
    render(
      <ChakraProvider>
        <Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />
      </ChakraProvider>
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    expect(screen.getByText('السابق')).toBeDisabled();
    expect(screen.getByText('التالي')).toBeDisabled();
  });

  it('handles edge case with many pages', () => {
    render(
      <ChakraProvider>
        <Pagination currentPage={50} totalPages={100} onPageChange={mockOnPageChange} />
      </ChakraProvider>
    );

    // Should show first page, ellipsis, pages around current page, ellipsis, and last page
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getAllByText('...').length).toBe(2);
    expect(screen.getByText('49')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('51')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('allows navigation to first and last pages', () => {
    render(
      <ChakraProvider>
        <Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('1'));
    expect(mockOnPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText('10'));
    expect(mockOnPageChange).toHaveBeenCalledWith(10);
  });
}); 