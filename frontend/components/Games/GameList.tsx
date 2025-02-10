import React, { useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  Spinner,
  Text,
  Select,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  useToast,
  Button,
  Center,
  VStack,
  Tabs,
  TabList,
  Tab,
  Icon,
} from '@chakra-ui/react';
import { createApi } from '@/utils/api';
import type { Game, Category } from '@/types/game';
import GameCard from './GameCard';
import { useAuth } from '@/hooks/useAuth';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';

const GameList: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const api = createApi((message) => 
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    })
  );

  const fetchCategories = async () => {
    try {
      const response = await api.get<{ results: Category[] }>('/games/categories/');
      if (response.error) {
        throw new Error(response.error.message);
      }
      if (!response.data) {
        throw new Error('No data received from server');
      }
      setCategories(response.data.results);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      throw err;
    }
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 1 ? '/games/my-games/' : '/games/';
      const response = await api.get<{ results: Game[]; next: string | null }>(endpoint);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      setGames(response.data.results);
      setNextPage(response.data.next);
      setError(null);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err instanceof Error ? err.message : 'Failed to load games');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!nextPage || loadingMore) return;
    try {
      setLoadingMore(true);
      const response = await api.get<{ results: Game[]; next: string | null }>(nextPage);
      if (response.error) {
        throw new Error(response.error.message);
      }
      if (response.data) {
        setGames(prev => [...prev, ...response.data.results]);
        setNextPage(response.data.next || null);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load more games',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchGames();
    fetchCategories();
  }, [activeTab]);

  const filteredGames = games
    .filter(game => {
      // Filter by category if selected
      if (category !== 'all') {
        // If game has no category and we're filtering by category, exclude it
        if (!game.category) return false;
        // If game category doesn't match selected category, exclude it
        if (game.category.slug !== category) return false;
      }
      
      // Filter by tab (All Games vs My Games)
      if (activeTab === 1 && user && game.seller) {
        return game.seller.id === user.id; // Show only user's games in My Games tab
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (loading && !loadingMore) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="300px">
        <Spinner data-testid="loading-spinner" size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {isAuthenticated && (
          <Button
            as={Link}
            href="/games/create"
            colorScheme="blue"
            leftIcon={<Icon as={FaPlus} />}
          >
            Create Game
          </Button>
        )}
      </Box>

      {isAuthenticated && (
        <Tabs onChange={setActiveTab} colorScheme="blue">
          <TabList>
            <Tab>Discover Games</Tab>
            <Tab>My Published Games</Tab>
          </TabList>
        </Tabs>
      )}

      <Box display="flex" gap={4}>
        <FormControl>
          <FormLabel>Category</FormLabel>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Sort by</FormLabel>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_at">Latest</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="title">Title</option>
          </Select>
        </FormControl>
      </Box>

      {filteredGames.length === 0 ? (
        <Text textAlign="center" fontSize="lg" color="gray.500">
          {activeTab === 1 ? 'You haven\'t created any games yet' : 'No games found'}
        </Text>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} as="ul" role="list">
            {filteredGames.map(game => (
              <Box as="li" key={game.id} role="listitem" data-testid="game-card">
                <GameCard game={game} />
              </Box>
            ))}
          </SimpleGrid>

          {nextPage && (
            <Center py={4}>
              <Button
                onClick={loadMore}
                isLoading={loadingMore}
                loadingText="Loading more..."
                variant="outline"
              >
                Load More
              </Button>
            </Center>
          )}
        </>
      )}
    </VStack>
  );
};

export default GameList; 