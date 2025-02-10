import { HStack, Icon, Text } from '@chakra-ui/react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface RatingStarsProps {
  rating: number;
  totalRatings: number;
  size?: number;
  showCount?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  totalRatings,
  size = 16,
  showCount = true,
}) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Icon
        key={`full-${i}`}
        as={FaStar}
        color="yellow.400"
        w={`${size}px`}
        h={`${size}px`}
        data-testid="star-icon"
        aria-label="full star"
      />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <Icon
        key="half"
        as={FaStarHalfAlt}
        color="yellow.400"
        w={`${size}px`}
        h={`${size}px`}
        data-testid="star-icon"
        aria-label="half star"
      />
    );
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Icon
        key={`empty-${i}`}
        as={FaRegStar}
        color="yellow.400"
        w={`${size}px`}
        h={`${size}px`}
        data-testid="star-icon"
        aria-label="empty star"
      />
    );
  }

  return (
    <HStack spacing={1} align="center">
      {stars}
      {showCount && (
        <Text fontSize="sm" color="gray.600" ml={2}>
          ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
        </Text>
      )}
    </HStack>
  );
};

export default RatingStars; 