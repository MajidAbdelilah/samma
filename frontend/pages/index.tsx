import React from 'react';
import { GetServerSideProps } from 'next';
import {
  Box,
  Container,
  Grid,
  Heading,
  HStack,
  Select,
  Input,
  IconButton,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import MainLayout from '../components/Layout/MainLayout';
import GameCard from '../components/Games/GameCard';
import CategoryTabs from '../components/Games/CategoryTabs';
import { Game, Category } from '../types';

interface HomeProps {
  games: Game[];
  categories: Category[];
  featuredGames: Game[];
}

export default function Home({ games, categories, featuredGames }: HomeProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('ranking');

  return (
    <MainLayout>
      <Container maxW="container.xl">
        {/* Search and Filter Section */}
        <Box mb={8}>
          <HStack spacing={4}>
            <Input
              placeholder="ابحث عن الألعاب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IconButton
              aria-label="Search"
              icon={<SearchIcon />}
              colorScheme="primary"
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              w="200px"
            >
              <option value="ranking">الترتيب</option>
              <option value="price-asc">السعر: من الأقل إلى الأعلى</option>
              <option value="price-desc">السعر: من الأعلى إلى الأقل</option>
              <option value="rating">التقييم</option>
            </Select>
          </HStack>
        </Box>

        {/* Categories Section */}
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Featured Games Section */}
        <Box my={8}>
          <Heading size="lg" mb={4}>
            الألعاب المميزة
          </Heading>
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={6}
          >
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </Grid>
        </Box>

        {/* All Games Section */}
        <Box my={8}>
          <Heading size="lg" mb={4}>
            جميع الألعاب
          </Heading>
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={6}
          >
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </Grid>
        </Box>
      </Container>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // In a real application, fetch this data from your API
  const games = []; // Fetch games from API
  const categories = []; // Fetch categories from API
  const featuredGames = []; // Fetch featured games from API

  return {
    props: {
      games,
      categories,
      featuredGames,
    },
  };
}; 