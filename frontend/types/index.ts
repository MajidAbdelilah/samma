export * from './game';
import type { Game } from './game';

export interface User {
  id: number;
  username: string;
  email: string;
  profile_picture?: string;
  bio?: string;
  date_of_birth?: string;
  phone_number?: string;
  paypal_email?: string;
  total_sales: number;
  total_games: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface FilterState {
  searchTerm: string;
  category: string;
  priceRange: [number, number];
  selectedTags: string[];
  sortBy: string;
}

export interface SearchFiltersProps {
  categories: Category[];
  tags: Tag[];
  onFiltersChange: (filters: FilterState) => void;
}

export interface UseGameSearchResult {
  games: Game[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

export interface GameVersion {
  id: string;
  gameId: string;
  version: string;
  notes?: string;
  fileSize: number;
  downloadCount: number;
  downloadUrl: string;
  isActive: boolean;
  uploadedAt: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'relevance', label: 'الأكثر صلة' },
  { value: 'price-asc', label: 'السعر: من الأقل إلى الأعلى' },
  { value: 'price-desc', label: 'السعر: من الأعلى إلى الأقل' },
  { value: 'rating', label: 'التقييم' },
  { value: 'newest', label: 'الأحدث' },
  { value: 'downloads', label: 'الأكثر تحميلاً' },
];

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export interface GameComment {
  id: number;
  game: Game;
  user: User;
  content: string;
  rating?: number;
  parent?: GameComment;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Payment {
  id: number;
  buyer: User;
  seller: User;
  game: Game;
  amount: number;
  platform_fee: number;
  seller_amount: number;
  paypal_transaction_id: string;
  paypal_payer_id: string;
  paypal_payment_id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  is_platform_fee_paid: boolean;
  is_seller_paid: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Transaction {
  id: number;
  payment: Payment;
  transaction_type: 'purchase' | 'refund' | 'platform_fee' | 'seller_payment';
  amount: number;
  paypal_transaction_id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user: User;
  notification_type: 'purchase' | 'sale' | 'comment' | 'rating' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface ApiError {
  message: string;
  code?: number;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
} 