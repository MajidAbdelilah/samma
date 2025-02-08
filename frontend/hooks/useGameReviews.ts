import { useState, useCallback } from 'react';
import { Review, ReviewFormData } from '../types/review';

interface UseGameReviewsResult {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
  isLoading: boolean;
  error: string | null;
  submitReview: (data: ReviewFormData) => Promise<void>;
  updateReview: (reviewId: string, data: ReviewFormData) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  likeReview: (reviewId: string) => Promise<void>;
}

export const useGameReviews = (gameId: string): UseGameReviewsResult => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/games/${gameId}/reviews`
      );
      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      setReviews(data.reviews);
      setTotalReviews(data.total);
      setAverageRating(data.averageRating);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  const submitReview = async (data: ReviewFormData) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/games/${gameId}/reviews`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) throw new Error('Failed to submit review');
    await fetchReviews();
  };

  const updateReview = async (reviewId: string, data: ReviewFormData) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/games/${gameId}/reviews/${reviewId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) throw new Error('Failed to update review');
    await fetchReviews();
  };

  const deleteReview = async (reviewId: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/games/${gameId}/reviews/${reviewId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) throw new Error('Failed to delete review');
    await fetchReviews();
  };

  const likeReview = async (reviewId: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/games/${gameId}/reviews/${reviewId}/like`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) throw new Error('Failed to like review');
    await fetchReviews();
  };

  return {
    reviews,
    totalReviews,
    averageRating,
    isLoading,
    error,
    submitReview,
    updateReview,
    deleteReview,
    likeReview,
  };
}; 