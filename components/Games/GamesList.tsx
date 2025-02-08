import { Box, HStack, VStack } from '@chakra-ui/react';
import GameFilters from './GameFilters';
import SortSelect from '../Common/SortSelect';
import GameSearchResults from './GameSearchResults';
import { useGameFilters } from '../../hooks/useGameFilters';
import { useGameSearch } from '../../hooks/useGameSearch';
import { SORT_OPTIONS, Category, Tag } from '../../types';

interface GamesListProps {
  categories: Category[];
  tags: Tag[];
}

const GamesList: React.FC<GamesListProps> = ({ categories, tags }) => {
  const { filters, updateFilters } = useGameFilters();
  const { games, loading, error, totalCount, currentPage, setCurrentPage } = useGameSearch(filters);

  return (
    <HStack align="start" spacing={8}>
      <Box w="300px">
        <GameFilters
          filters={filters}
          onFiltersChange={updateFilters}
          categories={categories}
          tags={tags}
        />
      </Box>

      <VStack flex={1} align="stretch" spacing={6}>
        <Box alignSelf="flex-end" w="200px">
          <SortSelect
            value={filters.sortBy}
            onChange={(value) => updateFilters({ sortBy: value })}
            options={SORT_OPTIONS}
          />
        </Box>

        <GameSearchResults
          games={games}
          isLoading={loading}
          error={error}
          totalCount={totalCount}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          itemsPerPage={12}
        />
      </VStack>
    </HStack>
  );
};

export default GamesList; 