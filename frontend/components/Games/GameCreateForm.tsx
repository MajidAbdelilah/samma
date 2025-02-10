import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  Select,
  Button,
  useToast,
  Image,
  Text,
  Center,
  Spinner,
  FormHelperText,
  Heading,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { createApi } from '@/utils/api';
import type { Category } from '@/types';

interface SystemRequirements {
  minimum: {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
  };
  recommended: {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
  };
}

interface GameFormData {
  title: string;
  description: string;
  price: string;
  bid_percentage: string;
  category_id: string;
  thumbnail: File | null;
  game_file: File | null;
  system_requirements: SystemRequirements;
}

interface GameResponse {
  slug: string;
}

const defaultSystemRequirements: SystemRequirements = {
  minimum: {
    os: '',
    processor: '',
    memory: '',
    graphics: '',
    storage: ''
  },
  recommended: {
    os: '',
    processor: '',
    memory: '',
    graphics: '',
    storage: ''
  }
};

const GameCreateForm: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  
  const api = createApi((message) => {
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  const [formData, setFormData] = useState<GameFormData>({
    title: '',
    description: '',
    price: '',
    bid_percentage: '5.00',
    category_id: '',
    thumbnail: null,
    game_file: null,
    system_requirements: defaultSystemRequirements,
  });

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated) {
        toast({
          title: 'Error',
          description: 'Please login first',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        router.replace('/login');
        return;
      }

      try {
        const { data, error } = await api.get<{ results: Category[] }>('/games/categories/');
        
        if (error) {
          throw new Error(error.message || 'Failed to fetch categories');
        }

        if (data?.results) {
          setCategories(data.results);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load categories',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsPageLoading(false);
      }
    };

    init();
  }, [isAuthenticated, router, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSystemRequirementsChange = (
    section: 'minimum' | 'recommended',
    field: string,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      system_requirements: {
        ...prev.system_requirements,
        [section]: {
          ...prev.system_requirements[section],
          [field]: value
        }
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnail' | 'game_file') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));

      if (field === 'thumbnail') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnailPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('bid_percentage', formData.bid_percentage);
      formDataToSend.append('category_id', formData.category_id);
      
      // Add files
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }
      if (formData.game_file) {
        formDataToSend.append('game_file', formData.game_file);
      }

      // Add system requirements
      formDataToSend.append('system_requirements', JSON.stringify(formData.system_requirements));

      const { data, error } = await api.post<{ id: number; slug: string }>('/games/', formDataToSend);

      if (error) {
        console.error('Error response:', error);
        throw new Error(error.message || 'Failed to create game');
      }

      if (!data || !data.slug) {
        throw new Error('No data or slug received from server');
      }

      toast({
        title: 'Success',
        description: 'Game created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Wait a short moment to ensure the game is properly created
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push(`/games/${data.slug}`);
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create game',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box bg="white" p={6} rounded="lg" shadow="md">
      <Box as="form" onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter game title"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter game description"
              minH="200px"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Price (USD)</FormLabel>
            <NumberInput min={0} precision={2}>
              <NumberInputField
                name="price"
                value={formData.price}
                onChange={(e) => handleInputChange({
                  target: { name: 'price', value: e.target.value }
                } as any)}
                placeholder="0.00"
              />
            </NumberInput>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Commission Rate (%)</FormLabel>
            <NumberInput min={5} max={100} precision={2} defaultValue={5}>
              <NumberInputField
                name="bid_percentage"
                value={formData.bid_percentage}
                onChange={(e) => handleInputChange({
                  target: { name: 'bid_percentage', value: e.target.value }
                } as any)}
                placeholder="5.00"
              />
            </NumberInput>
            <FormHelperText>
              Platform commission rate (minimum 5%). Higher rates may increase visibility.
            </FormHelperText>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Category</FormLabel>
            <Select
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              placeholder="Select category"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Thumbnail Image</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'thumbnail')}
            />
            {thumbnailPreview && (
              <Image
                src={thumbnailPreview}
                alt="Thumbnail preview"
                mt={2}
                maxH="200px"
                objectFit="cover"
              />
            )}
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Game File (ZIP)</FormLabel>
            <Input
              type="file"
              accept=".zip,.rar,.7z"
              onChange={(e) => handleFileChange(e, 'game_file')}
            />
          </FormControl>

          <Box>
            <Heading size="md" mb={4}>System Requirements</Heading>
            
            {['minimum', 'recommended'].map((section) => (
              <Box key={section} mb={6}>
                <Text fontWeight="bold" mb={2} textTransform="capitalize">
                  {section} Requirements
                </Text>
                <VStack spacing={4}>
                  {['os', 'processor', 'memory', 'graphics', 'storage'].map((field) => (
                    <FormControl key={field} isRequired>
                      <FormLabel textTransform="capitalize">{field}</FormLabel>
                      <Input
                        value={formData.system_requirements[section as 'minimum' | 'recommended'][field as keyof SystemRequirements['minimum']]}
                        onChange={(e) => handleSystemRequirementsChange(
                          section as 'minimum' | 'recommended',
                          field,
                          e.target.value
                        )}
                        placeholder={`Enter ${section} ${field} requirements`}
                      />
                    </FormControl>
                  ))}
                </VStack>
              </Box>
            ))}
          </Box>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            isLoading={loading}
          >
            Create Game
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default GameCreateForm; 