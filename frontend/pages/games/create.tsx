import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
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
  FormErrorMessage,
  SimpleGrid,
  Text,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import MainLayout from '../../components/Layout/MainLayout';
import { useAuth } from '../../hooks/useAuth';

interface GameFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  mainImage: File | null;
  gameFile: File | null;
  version: string;
  systemRequirements: {
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
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const CreateGame = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState<GameFormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    mainImage: null,
    gameFile: null,
    version: '1.0.0',
    systemRequirements: {
      minimum: {
        os: '',
        processor: '',
        memory: '',
        graphics: '',
        storage: '',
      },
      recommended: {
        os: '',
        processor: '',
        memory: '',
        graphics: '',
        storage: '',
      },
    },
  });

  useEffect(() => {
    // Check authentication status and fetch categories
    const init = async () => {
      if (typeof window !== 'undefined') {
        if (!isAuthenticated) {
          toast({
            title: 'خطأ',
            description: 'يجب تسجيل الدخول أولاً',
            status: 'error',
            duration: 3000,
          });
          router.replace('/login');
          return;
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/games/categories/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Categories fetch error:', errorData);
            throw new Error(errorData.detail || 'Failed to fetch categories');
          }
          
          const data = await response.json();
          if (data.results) {
            setCategories(data.results);
          } else {
            setCategories([]);
          }
        } catch (error) {
          console.error('Failed to fetch categories:', error);
          toast({
            title: 'خطأ',
            description: error instanceof Error ? error.message : 'فشل في تحميل التصنيفات',
            status: 'error',
            duration: 3000,
          });
          if (error instanceof Error && error.message.includes('Unauthorized')) {
            router.replace('/login');
          }
        }
        setIsPageLoading(false);
      }
    };
    init();
  }, [isAuthenticated, router, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle nested object paths (e.g., systemRequirements.minimum.os)
    if (name.includes('.')) {
      const parts = name.split('.');
      setFormData((prev) => {
        const newData = { ...prev };
        let current: any = newData;
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        mainImage: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGameFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        gameFile: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isAuthenticated) {
      toast({
        title: 'خطأ',
        description: 'يجب تسجيل الدخول أولاً',
        status: 'error',
        duration: 3000,
      });
      router.push('/login');
      return;
    }

    try {
      // Get CSRF token first
      const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/core/csrf/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!csrfResponse.ok) {
        const csrfError = await csrfResponse.json();
        throw new Error(csrfError.detail || 'Failed to get CSRF token');
      }

      const { csrfToken } = await csrfResponse.json();
      
      const formDataToSend = new FormData();
      
      // Handle basic fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category_id', formData.category);
      formDataToSend.append('version', formData.version);
      formDataToSend.append('tag_ids', JSON.stringify([])); // Empty array for now
      
      // Handle files
      if (formData.mainImage) {
        formDataToSend.append('main_image', formData.mainImage);
      }
      if (formData.gameFile) {
        formDataToSend.append('game_file', formData.gameFile);
      }
      
      // Handle system requirements as a stringified JSON
      formDataToSend.append('system_requirements', JSON.stringify({
        minimum: formData.systemRequirements.minimum,
        recommended: formData.systemRequirements.recommended
      }));

      // Add default bid percentage
      formDataToSend.append('bid_percentage', '5.0');

      // Add release date (current date)
      formDataToSend.append('release_date', new Date().toISOString().split('T')[0]);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/games`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfToken,
          'Accept': 'application/json',
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating game:', errorData);
        throw new Error(errorData.detail || JSON.stringify(errorData));
      }

      const data = await response.json();
      toast({
        title: 'نجاح',
        description: 'تم إنشاء اللعبة بنجاح',
        status: 'success',
        duration: 3000,
      });

      router.push(`/games/${data.slug}`);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في إنشاء اللعبة',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <MainLayout>
        <Center h="100vh">
          <Spinner size="xl" />
        </Center>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading>نشر لعبة جديدة</Heading>

          <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {/* Basic Information */}
              <FormControl isRequired>
                <FormLabel>عنوان اللعبة</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="أدخل عنوان اللعبة"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>الوصف</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="اكتب وصفاً للعبة"
                  minH="200px"
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isRequired>
                  <FormLabel>السعر (USD)</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      name="price"
                      value={formData.price}
                      onChange={(value) => handleInputChange({
                        target: { name: 'price', value }
                      } as any)}
                      placeholder="0.00"
                    />
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>التصنيف</FormLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="اختر تصنيفاً"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* File Uploads */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isRequired>
                  <FormLabel>الصورة الرئيسية</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {mainImagePreview && (
                    <Box mt={2}>
                      <Image
                        src={mainImagePreview}
                        alt="Game preview"
                        maxH="200px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    </Box>
                  )}
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>ملف اللعبة</FormLabel>
                  <Input
                    type="file"
                    accept=".zip,.rar,.7z"
                    onChange={handleGameFileChange}
                  />
                  {formData.gameFile && (
                    <Text mt={2} fontSize="sm" color="gray.600">
                      تم اختيار: {formData.gameFile.name}
                    </Text>
                  )}
                </FormControl>
              </SimpleGrid>

              {/* Version */}
              <FormControl>
                <FormLabel>الإصدار</FormLabel>
                <Input
                  name="version"
                  value={formData.version}
                  onChange={handleInputChange}
                  placeholder="1.0.0"
                />
              </FormControl>

              {/* System Requirements */}
              <Box>
                <Heading size="md" mb={4}>متطلبات النظام</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {/* Minimum Requirements */}
                  <Box>
                    <Heading size="sm" mb={2}>الحد الأدنى</Heading>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>نظام التشغيل</FormLabel>
                        <Input
                          name="systemRequirements.minimum.os"
                          value={formData.systemRequirements.minimum.os}
                          onChange={handleInputChange}
                          placeholder="مثال: Windows 10 64-bit"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>المعالج</FormLabel>
                        <Input
                          name="systemRequirements.minimum.processor"
                          value={formData.systemRequirements.minimum.processor}
                          onChange={handleInputChange}
                          placeholder="مثال: Intel Core i5-4460 / AMD FX-6300"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>الذاكرة</FormLabel>
                        <Input
                          name="systemRequirements.minimum.memory"
                          value={formData.systemRequirements.minimum.memory}
                          onChange={handleInputChange}
                          placeholder="مثال: 8 GB RAM"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>كرت الشاشة</FormLabel>
                        <Input
                          name="systemRequirements.minimum.graphics"
                          value={formData.systemRequirements.minimum.graphics}
                          onChange={handleInputChange}
                          placeholder="مثال: NVIDIA GTX 760 / AMD Radeon R7 260x"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>مساحة التخزين</FormLabel>
                        <Input
                          name="systemRequirements.minimum.storage"
                          value={formData.systemRequirements.minimum.storage}
                          onChange={handleInputChange}
                          placeholder="مثال: 50 GB"
                        />
                      </FormControl>
                    </VStack>
                  </Box>

                  {/* Recommended Requirements */}
                  <Box>
                    <Heading size="sm" mb={2}>الموصى به</Heading>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>نظام التشغيل</FormLabel>
                        <Input
                          name="systemRequirements.recommended.os"
                          value={formData.systemRequirements.recommended.os}
                          onChange={handleInputChange}
                          placeholder="مثال: Windows 11 64-bit"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>المعالج</FormLabel>
                        <Input
                          name="systemRequirements.recommended.processor"
                          value={formData.systemRequirements.recommended.processor}
                          onChange={handleInputChange}
                          placeholder="مثال: Intel Core i7-8700K / AMD Ryzen 5 3600X"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>الذاكرة</FormLabel>
                        <Input
                          name="systemRequirements.recommended.memory"
                          value={formData.systemRequirements.recommended.memory}
                          onChange={handleInputChange}
                          placeholder="مثال: 16 GB RAM"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>كرت الشاشة</FormLabel>
                        <Input
                          name="systemRequirements.recommended.graphics"
                          value={formData.systemRequirements.recommended.graphics}
                          onChange={handleInputChange}
                          placeholder="مثال: NVIDIA RTX 3060 / AMD RX 6600 XT"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>مساحة التخزين</FormLabel>
                        <Input
                          name="systemRequirements.recommended.storage"
                          value={formData.systemRequirements.recommended.storage}
                          onChange={handleInputChange}
                          placeholder="مثال: 100 GB SSD"
                        />
                      </FormControl>
                    </VStack>
                  </Box>
                </SimpleGrid>
              </Box>

              <Button
                type="submit"
                colorScheme="green"
                size="lg"
                isLoading={loading}
                loadingText="جاري النشر..."
              >
                نشر اللعبة
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </MainLayout>
  );
};

export default CreateGame; 