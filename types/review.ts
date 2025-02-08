export interface Review {
  id: string;
  gameId: string;
  userId: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  likes: number;
  isLiked?: boolean;
  isOwner?: boolean;
}

export interface ReviewFormData {
  rating: number;
  content: string;
} 