import type { NextPage } from 'next';
import { Container, Heading, Box } from '@chakra-ui/react';
import MainLayout from '@/components/Layout/MainLayout';
import GameList from '@/components/Games/GameList';

const GamesPage: NextPage = () => {
  return (
    <MainLayout>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading>Games</Heading>
        </Box>
        <GameList />
      </Container>
    </MainLayout>
  );
};

export default GamesPage; 