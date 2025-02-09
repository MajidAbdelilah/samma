import { useState, useCallback } from 'react';
import {
  UserStats,
  SalesData,
  RatingData,
  GameStats,
  AnalyticsFilter,
} from '../types/analytics';

interface UseAnalyticsResult {
  stats: UserStats | null;
  salesData: SalesData[];
  ratingData: RatingData[];
  topGames: GameStats[];
  isLoading: boolean;
  error: string | null;
  fetchAnalytics: (filter: AnalyticsFilter) => Promise<void>;
}

export const useAnalytics = (): UseAnalyticsResult => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [ratingData, setRatingData] = useState<RatingData[]>([]);
  const [topGames, setTopGames] = useState<GameStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (filter: AnalyticsFilter) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        period: filter.period,
        ...(filter.gameId && { gameId: filter.gameId }),
        ...(filter.customPeriod && {
          start: filter.customPeriod.start,
          end: filter.customPeriod.end,
        }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics?${params.toString()}`
      );

      if (!response.ok) throw new Error('Failed to fetch analytics data');

      const data = await response.json();
      setStats(data.stats);
      setSalesData(data.salesData);
      setRatingData(data.ratingData);
      setTopGames(data.topGames);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stats,
    salesData,
    ratingData,
    topGames,
    isLoading,
    error,
    fetchAnalytics,
  };
}; 