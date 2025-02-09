export interface UserStats {
  total_sales: number;
  total_revenue: number;
  platform_fees: number;
  seller_earnings: number;
  total_games: number;
  average_rating: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  sales: number;
}

export interface RatingData {
  title: string;
  rating: number;
  total_ratings: number;
}

export interface DownloadData {
  date: string;
  downloads: number;
}

export interface GameStats {
  id: string;
  title: string;
  revenue: number;
  sales: number;
  rating: number;
}

export interface AnalyticsPeriod {
  start: string;
  end: string;
}

export interface AnalyticsFilter {
  period: 'day' | 'week' | 'month' | 'year' | 'custom';
  customPeriod?: AnalyticsPeriod;
  gameId?: string;
} 