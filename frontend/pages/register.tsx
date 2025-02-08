import type { FormEvent, ChangeEvent } from 'react';
import { useState } from 'react';
import type { NextPage } from 'next';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Register: NextPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounts/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      toast({
        title: 'Success',
        description: 'Registration successful! Please check your email for verification.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Registration failed. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, setter: (value: string) => void): void => {
    setter(e.target.value);
  };

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8}>
        <Heading>Register</Heading>
        <Box as="form" onSubmit={handleSubmit} width="100%">
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, setEmail)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, setUsername)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, setPassword)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, setConfirmPassword)}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={isLoading}
            >
              Register
            </Button>

            <Text>
              Already have an account?{' '}
              <Link href="/login">
                <Text as="span" color="blue.500">
                  Login here
                </Text>
              </Link>
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Register; 