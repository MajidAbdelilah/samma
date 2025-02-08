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
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';

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

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/games/comments/?game=${gameId}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load comments',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gameId) {
      fetchComments();
    }
  }, [gameId]);

  const getCsrfToken = async (): Promise<string> => {
    try {
      // First, make a GET request to get a new CSRF token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/core/csrf/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }
      
      // Get the CSRF token from the cookie
      const cookies = document.cookie.split(';');
      const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrftoken='));
      if (!csrfCookie) {
        throw new Error('CSRF token not found in cookies');
      }
      
      return decodeURIComponent(csrfCookie.split('=')[1].trim());
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      throw error;
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      // Get a fresh CSRF token
      const csrfToken = await getCsrfToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/games/comments/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ 
          content: newComment,
          game: gameId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to post comment');
      }

      const data = await response.json();
      setComments([data, ...comments]);
      setNewComment('');
      toast({
        title: 'Success',
        description: 'Comment posted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to post comment',
        status: 'error',
        duration: 3000,
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