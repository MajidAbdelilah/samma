import React, { useState, useEffect } from 'react';
import {
  VStack,
  Box,
  Text,
  Button,
  Textarea,
  useToast,
  Avatar,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';
import { createApi } from '@/utils/api';

interface Comment {
  id: number;
  user: {
    username: string;
  };
  content: string;
  rating?: number;
  created_at: string;
}

interface CommentSectionProps {
  gameId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ gameId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  
  const api = createApi((message) => {
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  const fetchComments = async () => {
    if (!gameId) {
      console.error('No game ID provided');
      return;
    }

    console.log('Fetching comments for game:', gameId);
    try {
      const { data, error } = await api.get<Comment[]>(`/games/comments/?game=${gameId}`);
      
      if (error) {
        console.error('Error response from comments API:', error);
        throw new Error(error.message);
      }

      console.log('Comments data received:', data);
      if (data) {
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [gameId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    console.log('Submitting comment for game:', gameId);
    try {
      const { data, error } = await api.post<Comment>('/games/comments/', {
        content: newComment,
        game: gameId,
        rating: null
      });

      console.log('Comment submission response:', { data, error });
      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setComments([data, ...comments]);
        setNewComment('');
        toast({
          title: 'Success',
          description: 'Comment posted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to post comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {isAuthenticated && (
        <Box>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقك..."
            mb={2}
          />
          <Button
            colorScheme="blue"
            onClick={handleSubmitComment}
            isLoading={submitting}
            isDisabled={!newComment.trim()}
          >
            إرسال التعليق
          </Button>
        </Box>
      )}

      <VStack spacing={4} align="stretch">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Box key={comment.id} p={4} borderWidth={1} borderRadius="md">
              <HStack spacing={4} mb={2}>
                <Avatar size="sm" name={comment.user.username} />
                <Text fontWeight="bold">{comment.user.username}</Text>
                <Text color="gray.500" fontSize="sm">
                  {new Date(comment.created_at).toLocaleDateString('ar-SA')}
                </Text>
              </HStack>
              <Text>{comment.content}</Text>
            </Box>
          ))
        ) : (
          <Text textAlign="center" color="gray.500">
            لا توجد تعليقات بعد. كن أول من يعلق!
          </Text>
        )}
      </VStack>
    </VStack>
  );
};

export default CommentSection; 