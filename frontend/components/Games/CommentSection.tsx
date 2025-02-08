import React from 'react';
import {
  VStack,
  Box,
  Text,
  Avatar,
  HStack,
  Button,
  Textarea,
  Divider,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  gameId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ gameId }) => {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    fetchComments();
  }, [gameId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/games/${gameId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      const comment = await response.json();
      setComments((prev) => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Text fontSize="xl" fontWeight="bold">
        التعليقات
      </Text>

      {isAuthenticated && (
        <Box as="form" onSubmit={handleSubmitComment}>
          <Textarea
            placeholder="اكتب تعليقك..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            mb={2}
          />
          <Button
            type="submit"
            colorScheme="primary"
            isLoading={isLoading}
            isDisabled={!newComment.trim()}
          >
            إرسال التعليق
          </Button>
        </Box>
      )}

      <VStack align="stretch" spacing={4}>
        {comments.map((comment) => (
          <Box key={comment.id} p={4} bg="white" rounded="md" shadow="sm">
            <HStack spacing={3} mb={2}>
              <Avatar
                size="sm"
                name={comment.userName}
                src={comment.userAvatar}
              />
              <Box>
                <Text fontWeight="bold">{comment.userName}</Text>
                <Text fontSize="sm" color="gray.500">
                  {new Date(comment.createdAt).toLocaleDateString('ar-SA')}
                </Text>
              </Box>
            </HStack>
            <Text>{comment.content}</Text>
          </Box>
        ))}
      </VStack>
    </VStack>
  );
};

export default CommentSection; 