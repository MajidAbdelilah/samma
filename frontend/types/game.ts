import type { User } from './index';

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

export interface Game {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  rating: number;
  total_ratings: number;
  total_sales: number;
  seller: User;
  category: Category;
  tags?: Tag[];
  thumbnail?: string;
  game_file?: string;
  version: string;
  system_requirements?: Record<string, any>;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  bid_percentage: number;
} 