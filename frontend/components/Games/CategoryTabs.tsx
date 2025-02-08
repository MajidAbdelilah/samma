import React from 'react';
import { Tabs, TabList, Tab, Box } from '@chakra-ui/react';
import { Category } from '../../types';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryTabs = ({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryTabsProps) => {
  return (
    <Box overflowX="auto" whiteSpace="nowrap" mb={6}>
      <Tabs
        variant="soft-rounded"
        colorScheme="primary"
        value={selectedCategory}
        onChange={(value) => onSelectCategory(value)}
      >
        <TabList>
          <Tab value="all">الكل</Tab>
          {categories.map((category) => (
            <Tab key={category.id} value={category.slug}>
              {category.name}
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </Box>
  );
};

export default CategoryTabs; 