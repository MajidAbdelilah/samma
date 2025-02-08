import {
  VStack,
  Box,
  Text,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Checkbox,
  CheckboxGroup,
  Input,
  InputGroup,
  InputLeftElement,
  Collapse,
  Button,
  useDisclosure,
  Divider,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Category, Tag, FilterState } from '../../types';

interface GameFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: Category[];
  tags: Tag[];
}

const GameFilters: React.FC<GameFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  tags,
}) => {
  const { isOpen, onToggle } = useDisclosure({
    defaultIsOpen: false,
  });

  const handlePriceRangeChange = (range: [number, number]) => {
    onFiltersChange({ ...filters, priceRange: range });
  };

  const handleTagsChange = (selectedTags: string[]) => {
    onFiltersChange({ ...filters, selectedTags });
  };

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({ ...filters, category: categoryId });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFiltersChange({ ...filters, searchTerm: value });
  };

  return (
    <VStack spacing={4} align="stretch" w="full" role="search">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" aria-hidden="true" />
        </InputLeftElement>
        <Input
          placeholder="ابحث عن الألعاب..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          aria-label="ابحث عن الألعاب"
          data-testid="search-input"
        />
      </InputGroup>

      <Button
        rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        variant="ghost"
        onClick={onToggle}
        justifyContent="space-between"
        aria-expanded={isOpen}
        aria-controls="advanced-filters"
        data-testid="advanced-options-button"
      >
        خيارات متقدمة
      </Button>

      <Collapse in={isOpen} animateOpacity id="advanced-filters">
        <VStack spacing={4} align="stretch" pt={2}>
          <Box>
            <Text mb={2} fontWeight="medium" id="price-range-label">نطاق السعر</Text>
            <RangeSlider
              min={0}
              max={1000}
              step={10}
              value={filters.priceRange}
              onChange={handlePriceRangeChange}
              aria-labelledby={['price-range-label']}
            >
              <RangeSliderTrack>
                <RangeSliderFilledTrack />
              </RangeSliderTrack>
              <RangeSliderThumb index={0} aria-label="الحد الأدنى للسعر" />
              <RangeSliderThumb index={1} aria-label="الحد الأقصى للسعر" />
            </RangeSlider>
            <Text fontSize="sm" color="gray.600" mt={1} aria-live="polite">
              {filters.priceRange[0]}$ - {filters.priceRange[1]}$
            </Text>
          </Box>

          <Divider />

          <Box role="group" aria-labelledby="categories-label">
            <Text mb={2} fontWeight="medium" id="categories-label">التصنيفات</Text>
            <VStack align="start" spacing={2}>
              <Checkbox
                isChecked={filters.category === 'all'}
                onChange={() => handleCategoryChange('all')}
                data-testid="category-all"
              >
                الكل
              </Checkbox>
              {categories.map((category) => (
                <Checkbox
                  key={category.id}
                  isChecked={filters.category === category.id}
                  onChange={() => handleCategoryChange(category.id)}
                  data-testid={`category-${category.id}`}
                >
                  {category.name}
                </Checkbox>
              ))}
            </VStack>
          </Box>

          <Divider />

          <Box role="group" aria-labelledby="tags-label">
            <Text mb={2} fontWeight="medium" id="tags-label">الوسوم</Text>
            <CheckboxGroup
              value={filters.selectedTags}
              onChange={(values) => handleTagsChange(values as string[])}
            >
              <VStack align="start" spacing={2}>
                {tags.map((tag) => (
                  <Checkbox 
                    key={tag.id} 
                    value={tag.id}
                    data-testid={`tag-${tag.id}`}
                  >
                    {tag.name}
                  </Checkbox>
                ))}
              </VStack>
            </CheckboxGroup>
          </Box>
        </VStack>
      </Collapse>
    </VStack>
  );
};

export default GameFilters; 