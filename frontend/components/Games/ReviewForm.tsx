import { useState } from 'react';
import {
  VStack,
  HStack,
  Textarea,
  Button,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { ReviewFormData } from '../../types/review';

interface ReviewFormProps {
  gameId: string;
  onSubmit: (review: ReviewFormData) => Promise<void>;
  initialData?: ReviewFormData;
  isEdit?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  gameId,
  onSubmit,
  initialData,
  isEdit = false,
}) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [content, setContent] = useState(initialData?.content || '');
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'يرجى اختيار تقييم',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, content });
      toast({
        title: isEdit ? 'تم تحديث المراجعة بنجاح' : 'تم نشر المراجعة بنجاح',
        status: 'success',
        duration: 3000,
      });
      if (!isEdit) {
        setRating(0);
        setContent('');
      }
    } catch (error) {
      toast({
        title: 'فشل نشر المراجعة',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack spacing={2}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <Icon
            key={value}
            as={StarIcon}
            boxSize={6}
            color={(hoveredRating || rating) >= value ? 'yellow.400' : 'gray.200'}
            cursor="pointer"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(null)}
          />
        ))}
      </HStack>

      <Textarea
        placeholder="اكتب مراجعتك هنا..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        minH="120px"
      />

      <Button
        colorScheme="primary"
        isLoading={isSubmitting}
        onClick={handleSubmit}
      >
        {isEdit ? 'تحديث المراجعة' : 'نشر المراجعة'}
      </Button>
    </VStack>
  );
};

export default ReviewForm; 