import { useState, useEffect } from 'react';
import { Game, FilterState } from '../types';

interface UseGameSearchResult {
  games: Game[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export const useGameSearch = (
  filters: FilterState,
  itemsPerPage: number = 12
): UseGameSearchResult => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();
        if (filters.searchTerm) params.set('search', filters.searchTerm);
        if (filters.category !== 'all') params.set('category', filters.category);
        params.set('minPrice', filters.priceRange[0].toString());
        params.set('maxPrice', filters.priceRange[1].toString());
        if (filters.selectedTags.length > 0) {
          params.set('tags', filters.selectedTags.join(','));
        }
        params.set('sortBy', filters.sortBy);
        params.set('page', currentPage.toString());
        params.set('limit', itemsPerPage.toString());

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/games/search?${params.toString()}`
        );
        if (!response.ok) throw new Error('Failed to fetch games');

        const data = await response.json();
        setGames(data.games);
        setTotalCount(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [filters, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return {
    games,
    loading,
    error,
    totalCount,
    currentPage,
    setCurrentPage,
  };
}; 