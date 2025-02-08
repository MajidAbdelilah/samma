export interface Game {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  commentCount: number;
  bidPercentage: number;
  thumbnailUrl: string;
  categories: string[];
  tags: string[];
  seller: {
    id: string;
    name: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
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