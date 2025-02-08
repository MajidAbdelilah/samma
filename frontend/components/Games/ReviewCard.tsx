import { useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Avatar,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { BsThreeDotsVertical, BsHandThumbsUp } from 'react-icons/bs';
import { Review } from '../../types/review';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ReviewCardProps {
  review: Review;
  onEdit?: () => void;
  onDelete?: () => void;
  onLike?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  onLike,
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const handleLike = async () => {
    setIsLiking(true);
    try {
      await onLike?.();
    } catch (error) {
      toast({
        title: 'فشل الإعجاب بالمراجعة',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete?.();
      toast({
        title: 'تم حذف المراجعة بنجاح',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'فشل حذف المراجعة',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box p={4} borderWidth={1} borderRadius="lg">
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Avatar
              size="sm"
              name={review.user.name}
              src={review.user.avatarUrl}
            />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold">{review.user.name}</Text>
              <Text fontSize="sm" color="gray.500">
                {formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true,
                  locale: ar,
                })}
              </Text>
            </VStack>
          </HStack>

          {review.isOwner && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<BsThreeDotsVertical />}
                variant="ghost"
                size="sm"
                aria-label="المزيد من الخيارات"
              />
              <MenuList>
                <MenuItem onClick={onEdit}>تعديل</MenuItem>
                <MenuItem onClick={handleDelete}>حذف</MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>

        <HStack>
          {[...Array(10)].map((_, index) => (
            <StarIcon
              key={index}
              color={index < review.rating ? 'yellow.400' : 'gray.200'}
              boxSize={4}
            />
          ))}
          <Text fontSize="sm" color="gray.600" ml={2}>
            {review.rating}/10
          </Text>
        </HStack>

        <Text>{review.content}</Text>

        <HStack>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<BsHandThumbsUp />}
            onClick={handleLike}
            isLoading={isLiking}
            colorScheme={review.isLiked ? 'primary' : 'gray'}
          >
            {review.likes} إعجاب
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ReviewCard; 