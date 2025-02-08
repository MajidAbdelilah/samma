export interface RatingStarsProps {
  gameId: string;
  currentRating: number;
  onRatingChange?: (newRating: number) => void;
  isInteractive?: boolean;
} 