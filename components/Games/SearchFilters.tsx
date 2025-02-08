import { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  Input,
  Select,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  VStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { Category, Tag as GameTag } from '../../types';
import debounce from 'lodash/debounce';

interface SearchFiltersProps {
  categories: Category[];
  tags: GameTag[];
  onFiltersChange: (filters: FilterState) => void;
}

interface FilterState {
  searchTerm: string;
  category: string;
  priceRange: [number, number];
  selectedTags: string[];
  sortBy: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  categories,
  tags,
  onFiltersChange,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    category: 'all',
    priceRange: [0, 100],
    selectedTags: [],
    sortBy: 'relevance',
  });

  // Debounce the filter changes to prevent too many API calls
  const debouncedFiltersChange = debounce((newFilters: FilterState) => {
    onFiltersChange(newFilters);
  }, 300);

  useEffect(() => {
    debouncedFiltersChange(filters);
    return () => {
      debouncedFiltersChange.cancel();
    };
  }, [filters]);

  const handleTagToggle = (tagId: string) => {
    setFilters(prev => {
      const newTags = prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(t => t !== tagId)
        : [...prev.selectedTags, tagId];
      return { ...prev, selectedTags: newTags };
    });
  };

  return (
    <Box w="full" bg="white" p={4} rounded="lg" shadow="sm">
      <VStack spacing={4} align="stretch">
        <Input
          placeholder="ابحث عن الألعاب..."
          value={filters.searchTerm}
          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
        />

        <HStack spacing={4}>
          <Select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="all">جميع التصنيفات</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          <Select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          >
            <option value="relevance">الأكثر صلة</option>
            <option value="price-asc">السعر: من الأقل إلى الأعلى</option>
            <option value="price-desc">السعر: من الأعلى إلى الأقل</option>
            <option value="rating">التقييم</option>
            <option value="newest">الأحدث</option>
          </Select>
        </HStack>

        <Box>
          <Text mb={2}>نطاق السعر</Text>
          <RangeSlider
            min={0}
            max={100}
            step={5}
            value={filters.priceRange}
            onChange={(value) => setFilters({ ...filters, priceRange: value })}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
          <HStack justify="space-between" mt={1}>
            <Text>${filters.priceRange[0]}</Text>
            <Text>${filters.priceRange[1]}</Text>
          </HStack>
        </Box>

        <Box>
          <Text mb={2}>الوسوم</Text>
          <Wrap spacing={2}>
            {tags.map((tag) => (
              <WrapItem key={tag.id}>
                <Tag
                  size="md"
                  variant={filters.selectedTags.includes(tag.id) ? 'solid' : 'outline'}
                  colorScheme="primary"
                  cursor="pointer"
                  onClick={() => handleTagToggle(tag.id)}
                >
                  <TagLabel>{tag.name}</TagLabel>
                  {filters.selectedTags.includes(tag.id) && (
                    <TagCloseButton onClick={(e) => {
                      e.stopPropagation();
                      handleTagToggle(tag.id);
                    }} />
                  )}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      </VStack>
    </Box>
  );
};

export default SearchFilters; 