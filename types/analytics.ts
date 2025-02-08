export interface UserStats {
  totalGames: number;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  totalDownloads: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  sales: number;
}

export interface RatingData {
  date: string;
  rating: number;
  count: number;
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
  downloads: number;
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