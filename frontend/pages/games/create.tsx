import type { NextPage } from 'next';
import { Container, Heading, Box } from '@chakra-ui/react';
import MainLayout from '@/components/Layout/MainLayout';
import GameCreateForm from '@/components/Games/GameCreateForm';

const CreateGamePage: NextPage = () => {
  return (
    <MainLayout>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading>Create New Game</Heading>
                    </Box>
        <GameCreateForm />
      </Container>
    </MainLayout>
  );
};

export default CreateGamePage; 