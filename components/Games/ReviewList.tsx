import {
  VStack,
  Box,
  Text,
  Button,
  Spinner,
  Center,
  HStack,
  Select,
} from '@chakra-ui/react';
import { useState } from 'react';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import { useGameReviews } from '../../hooks/useGameReviews';
import { Review } from '../../types/review';

interface ReviewListProps {
  gameId: string;
  isAuthenticated: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({ gameId, isAuthenticated }) => {
  const {
    reviews,
    totalReviews,
    averageRating,
    isLoading,
    error,
    submitReview,
    updateReview,
    deleteReview,
    likeReview,
  } = useGameReviews(gameId);

  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'likes'>('recent');
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const handleSort = (value: 'recent' | 'rating' | 'likes') => {
    setSortBy(value);
    // Implement sorting logic here or in the API
  };

  if (isLoading) {
    return (
      <Center py={8}>
        <Spinner size="xl" color="primary.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center py={8}>
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'likes':
        return b.likes - a.likes;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          المراجعات ({totalReviews})
        </Text>
        <Text fontSize="lg">
          متوسط التقييم: {averageRating.toFixed(1)}/10
        </Text>
      </Box>

      {isAuthenticated && !editingReview && (
        <Box>
          <Text fontSize="lg" fontWeight="medium" mb={4}>
            أضف مراجعتك
          </Text>
          <ReviewForm
            gameId={gameId}
            onSubmit={submitReview}
          />
        </Box>
      )}

      {editingReview && (
        <Box>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="medium">
              تعديل المراجعة
            </Text>
            <Button
              variant="ghost"
              onClick={() => setEditingReview(null)}
            >
              إلغاء
            </Button>
          </HStack>
          <ReviewForm
            gameId={gameId}
            onSubmit={async (data) => {
              await updateReview(editingReview.id, data);
              setEditingReview(null);
            }}
            initialData={{
              rating: editingReview.rating,
              content: editingReview.content,
            }}
            isEdit
          />
        </Box>
      )}

      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="medium">
          جميع المراجعات
        </Text>
        <Select
          value={sortBy}
          onChange={(e) => handleSort(e.target.value as typeof sortBy)}
          w="200px"
        >
          <option value="recent">الأحدث</option>
          <option value="rating">التقييم</option>
          <option value="likes">الإعجابات</option>
        </Select>
      </HStack>

      <VStack spacing={4} align="stretch">
        {sortedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onEdit={() => setEditingReview(review)}
            onDelete={() => deleteReview(review.id)}
            onLike={() => likeReview(review.id)}
          />
        ))}
      </VStack>
    </VStack>
  );
};

export default ReviewList; 