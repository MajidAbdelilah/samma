declare module 'stylis-plugin-rtl' {
  const rtlPlugin: any;
  export default rtlPlugin;
}

declare module '@emotion/cache' {
  interface CacheOptions {
    key: string;
    stylisPlugins?: any[];
    [key: string]: any;
  }
  
  function createCache(options: CacheOptions): any;
  export default createCache;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Game {
  id: number;
  title: string;
  description: string;
  price: number;
  category: Category;
  image_url?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  date_joined: string;
}

export interface Comment {
  id: number;
  user: User;
  game: Game;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: number;
  user: User;
  game: Game;
  score: number;
  created_at: string;
} 