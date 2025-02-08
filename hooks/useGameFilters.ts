import { useState, useCallback } from 'react';
import { FilterState } from '../types';

const defaultFilters: FilterState = {
  searchTerm: '',
  category: 'all',
  priceRange: [0, 1000],
  selectedTags: [],
  sortBy: 'relevance',
};

export const useGameFilters = (initialFilters?: Partial<FilterState>) => {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  });

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    filters,
    updateFilters,
    resetFilters,
  };
}; 