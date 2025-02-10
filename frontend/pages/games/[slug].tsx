import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  Image,
  Heading,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { createApi } from '@/utils/api';
import type { Game } from '@/types';
import ReviewList from '@/components/Games/ReviewList';
import ReviewForm from '@/components/Games/ReviewForm';
import GameVersions from '@/components/Games/GameVersions';
import GameDownload from '@/components/Games/GameDownload';
import GameAnalytics from '@/components/Games/GameAnalytics';
import RatingStars from '@/components/Games/RatingStars';
import CommentSection from '@/components/Games/CommentSection';

const GameDetailPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [game, setGame] = useState<Game | null>(null);
  const [versions, setVersions] = useState<GameVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVersions, setLoadingVersions] = useState(false);

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
    const fetchGame = async () => {
      if (!slug) return;
      
      try {
        const { data, error } = await api.get<Game>(`/games/${slug}/`);
        if (error) throw new Error(error.message);
        if (data) {
          setGame(data);
          // Fetch versions after getting game data
          setLoadingVersions(true);
          try {
            const { data: versionsData, error: versionsError } = await api.get<{ results: GameVersion[] }>(`/games/${data.id}/versions/`);
            if (versionsError) throw new Error(versionsError.message);
            if (versionsData?.results) setVersions(versionsData.results);
          } catch (err) {
            console.error('Error fetching versions:', err);
            toast({
              title: 'Error',
              description: 'Failed to load game versions',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          } finally {
            setLoadingVersions(false);
          }
        }
      } catch (err) {
        console.error('Error fetching game:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to load game',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [slug]);

  if (loading) {
    return (
      <MainLayout>
        <Center minH="60vh">
          <Spinner size="xl" />
        </Center>
      </MainLayout>
    );
  }

  if (!game) {
    return (
      <MainLayout>
        <Container maxW="container.xl" py={8}>
          <Text>Game not found</Text>
        </Container>
      </MainLayout>
    );
  }

  const isOwner = user?.id === game.seller.id;

  return (
    <MainLayout>
      <Container maxW="container.xl" py={8}>
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          <GridItem>
            <VStack align="stretch" spacing={6}>
              <Image
                src={game.thumbnail || '/images/game-placeholder.svg'}
                alt={game.title}
                borderRadius="lg"
                objectFit="cover"
                width="100%"
                height="400px"
              />
              
              <Box>
                <Heading as="h1" size="xl" mb={2}>
                  {game.title}
                </Heading>
                <Text color="gray.500" mb={4}>
                  by {game.seller.username}
                </Text>
                <RatingStars rating={game.rating} totalRatings={game.total_ratings} />
              </Box>

              <Tabs colorScheme="blue">
                <TabList>
                  <Tab>Description</Tab>
                  <Tab>Reviews</Tab>
                  <Tab>Comments</Tab>
                  {isOwner && <Tab>Analytics</Tab>}
                  {isOwner && <Tab>Versions</Tab>}
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Text whiteSpace="pre-wrap">{game.description}</Text>
                    
                    {game.system_requirements && (
                      <Box mt={6}>
                        <Heading size="md" mb={4}>System Requirements</Heading>
                        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                          {['minimum', 'recommended'].map((type) => (
                            <Box key={type}>
                              <Text fontWeight="bold" mb={2} textTransform="capitalize">
                                {type} Requirements
                              </Text>
                              {Object.entries(game.system_requirements[type] || {}).map(([key, value]) => (
                                <Box key={key} mb={2}>
                                  <Text fontWeight="semibold" textTransform="capitalize">
                                    {key}:
                                  </Text>
                                  <Text>{value}</Text>
                                </Box>
                              ))}
                            </Box>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </TabPanel>

                  <TabPanel>
                    <VStack align="stretch" spacing={6}>
                      {isAuthenticated && <ReviewForm gameId={game.id} />}
                      <ReviewList gameId={game.id} />
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <CommentSection gameId={game.id} />
                  </TabPanel>

                  {isOwner && (
                    <TabPanel>
                      <GameAnalytics gameId={game.id} />
                    </TabPanel>
                  )}

                  {isOwner && (
                    <TabPanel>
                      {loadingVersions ? (
                        <Center py={8}>
                          <Spinner size="lg" />
                        </Center>
                      ) : (
                        <GameVersions
                          gameId={game.id}
                          versions={versions}
                          onVersionDelete={(versionId) => {
                            setVersions(prev => prev.filter(v => v.id !== versionId));
                          }}
                        />
                      )}
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>
            </VStack>
          </GridItem>

          <GridItem>
            <Box position="sticky" top="20px">
              <VStack
                spacing={4}
                p={6}
                bg="white"
                borderRadius="lg"
                boxShadow="md"
                align="stretch"
              >
                <Heading size="lg">${game.price}</Heading>
                <GameDownload game={game} />
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </MainLayout>
  );
};

export default GameDetailPage; 