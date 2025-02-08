import { useState } from 'react';
import {
  SimpleGrid,
  Text,
  VStack,
  Spinner,
  Center,
} from '@chakra-ui/react';
import GameCard from './GameCard';
import Pagination from '../Common/Pagination';
import { Game } from '../../types';

interface GameSearchResultsProps {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

const GameSearchResults: React.FC<GameSearchResultsProps> = ({
  games,
  isLoading,
  error,
  totalCount,
  currentPage,
  onPageChange,
  itemsPerPage,
}) => {
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (isLoading) {
    return (
      <Center py={8}>
        <Spinner size="xl" color="primary.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center py={8}>
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  if (games.length === 0) {
    return (
      <Center py={8}>
        <Text>لم يتم العثور على ألعاب</Text>
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Text fontSize="sm" color="gray.600">
        تم العثور على {totalCount} لعبة
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </SimpleGrid>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </VStack>
  );
};

export default GameSearchResults; 