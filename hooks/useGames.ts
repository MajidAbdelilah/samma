import { useState, useEffect } from 'react';
import { Game } from '../types';

interface UseGamesOptions {
  category?: string;
  searchTerm?: string;
  sortBy?: string;
}

export const useGames = ({ category, searchTerm, sortBy }: UseGamesOptions = {}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (category && category !== 'all') queryParams.set('category', category);
        if (searchTerm) queryParams.set('search', searchTerm);
        if (sortBy) queryParams.set('sort', sortBy);

        const response = await fetch(`/api/games?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch games');

        const data = await response.json();
        setGames(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [category, searchTerm, sortBy]);

  return { games, loading, error };
}; 