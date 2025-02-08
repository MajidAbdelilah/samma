import React from 'react';
import {
  Container,
  Heading,
  Box,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import MainLayout from '../../components/Layout/MainLayout';
import GameForm from '../../components/Games/GameForm';
import { Category } from '../../types';
import { useRouter } from 'next/router';

interface NewGamePageProps {
  categories: Category[];
}

export default function NewGamePage({ categories }: NewGamePageProps) {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const response = await fetch('/api/games', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const { id } = await response.json();
      router.push(`/games/${id}`);
    } else {
      throw new Error('Failed to create game');
    }
  };

  return (
    <MainLayout>
      <Container maxW="container.xl" py={8}>
        <Box bg="white" p={6} rounded="lg" shadow="md">
          <Heading mb={6}>نشر لعبة جديدة</Heading>
          <GameForm
            categories={categories}
            onSubmit={handleSubmit}
          />
        </Box>
      </Container>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // Fetch categories from API
  const categories = [
    { id: '1', name: 'أكشن', slug: 'action' },
    { id: '2', name: 'مغامرة', slug: 'adventure' },
    { id: '3', name: 'رياضة', slug: 'sports' },
  ];

  return {
    props: {
      categories,
    },
  };
}; 