import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import MainLayout from '../../components/Layout/MainLayout';
import AnalyticsDashboard from '@/components/Analytics/AnalyticsDashboard';
import GameList from '@/components/Games/GameList';
import { createApi } from '@/utils/api';
import type { Game } from '@/types';

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);

  const api = createApi((message) => {
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  });

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      try {
        const { data, error } = await api.get<{ results: Game[] }>('/games/my-games/');
        if (error) throw new Error(error.message);
        if (data?.results) {
          setGames(data.results);
        }
      } catch (err) {
        console.error('Error fetching games:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to load games',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isAuthenticated, router, api, toast]);

  if (loading) {
    return (
      <MainLayout>
        <Center h="100vh">
          <Spinner size="xl" />
        </Center>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading mb={6}>لوحة التحكم</Heading>
        </Box>

        <Tabs colorScheme="blue">
          <TabList>
            <Tab>نظرة عامة</Tab>
            <Tab>الألعاب</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <AnalyticsDashboard games={games.map(game => ({ id: game.id.toString(), title: game.title }))} />
            </TabPanel>
            <TabPanel px={0}>
              <GameList />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </MainLayout>
  );
};

export default Dashboard; 