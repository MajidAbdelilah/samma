import React, { useState } from 'react';
import {
  HStack,
  IconButton,
  Text,
  useToast,
  ToastStatus,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { useAuth } from '../../hooks/useAuth';
import { RatingStarsProps } from './types';

interface ToastMessage {
  title: string;
  status: ToastStatus;
  duration: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  gameId,
  currentRating,
  onRatingChange,
  isInteractive = true,
}) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const showToast = ({ title, status, duration }: ToastMessage) => {
    toast({
      title,
      status,
      duration,
      isClosable: true,
    });
  };

  const handleRating = async (rating: number): Promise<void> => {
    if (!isAuthenticated) {
      showToast({
        title: 'يجب تسجيل الدخول للتقييم',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      const response = await fetch(`/api/games/${gameId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) throw new Error('Failed to submit rating');

      onRatingChange?.(rating);
      showToast({
        title: 'تم حفظ التقييم بنجاح',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      showToast({
        title: 'فشل حفظ التقييم',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <HStack spacing={1}>
      {[...Array(10)].map((_, index) => {
        const rating = index + 1;
        const isFilled = (hoveredRating || currentRating) >= rating;

        return (
          <IconButton
            key={index}
            size="sm"
            variant="ghost"
            icon={
              <StarIcon
                color={isFilled ? 'yellow.400' : 'gray.300'}
                boxSize={5}
              />
            }
            aria-label={`Rate ${rating}`}
            onClick={() => isInteractive && handleRating(rating)}
            onMouseEnter={() => isInteractive && setHoveredRating(rating)}
            onMouseLeave={() => isInteractive && setHoveredRating(null)}
            isDisabled={!isInteractive}
          />
        );
      })}
      <Text fontSize="lg" fontWeight="bold" ml={2}>
        {currentRating.toFixed(1)}/10
      </Text>
    </HStack>
  );
};

export default RatingStars; 