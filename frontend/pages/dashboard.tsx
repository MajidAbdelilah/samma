import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      toast({
        title: 'Success',
        description: 'Logged out successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={4}>Welcome, {user.username}!</Heading>
          <Text fontSize="lg" color="gray.600">
            This is your personal dashboard where you can manage your games and account.
          </Text>
        </Box>

        <Box>
          <Button colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default Dashboard; 