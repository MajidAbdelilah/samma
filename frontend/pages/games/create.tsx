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
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { createApi } from '@/utils/api';

interface GameFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  mainImage: File | null;
  gameFile: File | null;
  version: string;
  bid_percentage: string;
  release_date: string;
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

interface GameResponse {
  id: string;
  title: string;
  description: string;
  // Add other fields as needed
}

const CreateGame = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
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
    category: '',
    mainImage: null,
    gameFile: null,
    version: '1.0.0',
    bid_percentage: '5.00',
    release_date: new Date().toISOString().split('T')[0],
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
    const init = async () => {
      if (!isAuthenticated) {
        toast({
          title: 'خطأ',
          description: 'يجب تسجيل الدخول أولاً',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        router.replace('/login');
        return;
      }

      console.log('Fetching categories...');
      try {
        const { data, error } = await api.get<{ results: Category[] }>('/games/categories/');
        
        console.log('Categories response:', { data, error });
        if (error) {
          console.error('Categories fetch error:', error);
          throw new Error(error.message || 'Failed to fetch categories');
        }

        if (data?.results) {
          console.log('Setting categories:', data.results);
          setCategories(data.results);
        } else {
          console.warn('No categories found. Please make sure categories exist in the database.');
          toast({
            title: 'تنبيه',
            description: 'لا توجد تصنيفات متاحة. يرجى التأكد من وجود تصنيفات في قاعدة البيانات.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast({
          title: 'خطأ',
          description: error instanceof Error ? error.message : 'فشل في تحميل التصنيفات',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'mainImage' | 'gameFile') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));

      if (field === 'mainImage') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMainImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get a fresh CSRF token before submitting
      await api.get('/core/csrf/');
      
      const formDataToSend = new FormData();
      
      // Log the form data being sent
      console.log('Form data values:', {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category_id: formData.category,
        version: formData.version,
        release_date: formData.release_date,
        bid_percentage: formData.bid_percentage,
        has_main_image: !!formData.mainImage,
        has_game_file: !!formData.gameFile,
        system_requirements: formData.systemRequirements,
      });
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('category_id', formData.category);
      formDataToSend.append('version', formData.version);
      formDataToSend.append('tag_ids', JSON.stringify([]));
      formDataToSend.append('release_date', formData.release_date);
      formDataToSend.append('bid_percentage', formData.bid_percentage);
      
      if (formData.mainImage) {
        formDataToSend.append('main_image', formData.mainImage);
      }
      if (formData.gameFile) {
        formDataToSend.append('game_file', formData.gameFile);
      }
      
      const systemRequirements = {
        minimum: formData.systemRequirements.minimum,
        recommended: formData.systemRequirements.recommended
      };
      formDataToSend.append('system_requirements', JSON.stringify(systemRequirements));

      // Log the FormData entries
      console.log('FormData entries:');
      Array.from(formDataToSend.keys()).forEach(key => {
        console.log(`${key}:`, formDataToSend.get(key));
      });
      
      const { data, error } = await api.post<GameResponse>(
        '/games/',
        formDataToSend
      );

      if (error) {
        console.error('Game creation error:', error);
        throw new Error(error.message || 'Failed to create game');
      }

      if (!data) {
        throw new Error('No data received from server');
      }

      toast({
        title: 'نجاح',
        description: 'تم إنشاء اللعبة بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push(`/games/${data.id}`);
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في إنشاء اللعبة',
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
      <MainLayout>
        <Center h="100vh">
          <Spinner size="xl" />
        </Center>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxW="container.xl" py={8}>
        <Box bg="white" p={6} rounded="lg" shadow="md">
          <Heading mb={6}>نشر لعبة جديدة</Heading>
          
          <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={6}>
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
                <FormLabel>وصف اللعبة</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="أدخل وصف اللعبة"
                  minH="200px"
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                <FormControl isRequired>
                  <FormLabel>السعر (USD)</FormLabel>
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

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                <FormControl isRequired>
                  <FormLabel>صورة اللعبة الرئيسية</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e as any, 'mainImage')}
                  />
                  {mainImagePreview && (
                    <Image
                      src={mainImagePreview}
                      alt="Game preview"
                      mt={2}
                      maxH="200px"
                      objectFit="cover"
                    />
                  )}
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>ملف اللعبة</FormLabel>
                  <Input
                    type="file"
                    accept=".zip,.rar,.7z"
                    onChange={(e) => handleFileChange(e as any, 'gameFile')}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                <FormControl isRequired>
                  <FormLabel>نسبة العمولة (%)</FormLabel>
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
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>تاريخ الإصدار</FormLabel>
                  <Input
                    type="date"
                    name="release_date"
                    value={formData.release_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </FormControl>
              </SimpleGrid>

              <Box w="full">
                <Heading size="md" mb={4}>متطلبات النظام</Heading>
                
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="bold" mb={2}>الحد الأدنى</Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>نظام التشغيل</FormLabel>
                        <Input
                          name="minimum.os"
                          value={formData.systemRequirements.minimum.os}
                          onChange={(e) => handleInputChange({
                            target: {
                              name: 'systemRequirements',
                              value: {
                                ...formData.systemRequirements,
                                minimum: {
                                  ...formData.systemRequirements.minimum,
                                  os: e.target.value
                                }
                              }
                            }
                          } as any)}
                          placeholder="مثال: Windows 10 64-bit"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>المعالج</FormLabel>
                        <Input
                          name="minimum.processor"
                          value={formData.systemRequirements.minimum.processor}
                          onChange={(e) => handleInputChange({
                            target: {
                              name: 'systemRequirements',
                              value: {
                                ...formData.systemRequirements,
                                minimum: {
                                  ...formData.systemRequirements.minimum,
                                  processor: e.target.value
                                }
                              }
                            }
                          } as any)}
                          placeholder="مثال: Intel Core i5"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>الذاكرة</FormLabel>
                        <Input
                          name="minimum.memory"
                          value={formData.systemRequirements.minimum.memory}
                          onChange={(e) => handleInputChange({
                            target: {
                              name: 'systemRequirements',
                              value: {
                                ...formData.systemRequirements,
                                minimum: {
                                  ...formData.systemRequirements.minimum,
                                  memory: e.target.value
                                }
                              }
                            }
                          } as any)}
                          placeholder="مثال: 8 GB RAM"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>كرت الشاشة</FormLabel>
                        <Input
                          name="minimum.graphics"
                          value={formData.systemRequirements.minimum.graphics}
                          onChange={(e) => handleInputChange({
                            target: {
                              name: 'systemRequirements',
                              value: {
                                ...formData.systemRequirements,
                                minimum: {
                                  ...formData.systemRequirements.minimum,
                                  graphics: e.target.value
                                }
                              }
                            }
                          } as any)}
                          placeholder="مثال: NVIDIA GTX 1060"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>مساحة التخزين</FormLabel>
                        <Input
                          name="minimum.storage"
                          value={formData.systemRequirements.minimum.storage}
                          onChange={(e) => handleInputChange({
                            target: {
                              name: 'systemRequirements',
                              value: {
                                ...formData.systemRequirements,
                                minimum: {
                                  ...formData.systemRequirements.minimum,
                                  storage: e.target.value
                                }
                              }
                            }
                          } as any)}
                          placeholder="مثال: 50 GB"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>الموصى به</Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>نظام التشغيل</FormLabel>
                        <Input
                          name="recommended.os"
                          value={formData.systemRequirements.recommended.os}
                          onChange={(e) => handleInputChange({
                            target: {
                              name: 'systemRequirements',
                              value: {
                                ...formData.systemRequirements,
                                recommended: {
                                  ...formData.systemRequirements.recommended,
                                  os: e.target.value
                                }
                              }
                            }
                          } as any)}
                          placeholder="مثال: Windows 11 64-bit"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>المعالج</FormLabel>
                        <Input
                          name="recommended.processor"
                          value={formData.systemRequirements.recommended.processor}
                          onChange={(e) => handleInputChange({
                            target: {
                              name: 'systemRequirements',
                              value: {
                                ...formData.systemRequirements,
                                recommended: {
                                  ...formData.systemRequirements.recommended,
                                  processor: e.target.value
                                }
                              }
                            }
                          } as any)}
                          placeholder="مثال: Intel Core i7"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>الذاكرة</FormLabel>
                        <Input
                          name="recommended.memory"
                          value={formData.systemRequirements.recommended.memory}
                          onChange={(e) => handleInputChange({
                            target: {
                              name: 'systemRequirements',
                              value: {
                                ...formData.systemRequirements,
                                recommended: {
                                  ...formData.systemRequirements.recommended,
                                  memory: e.target.value
                                }
                              }
                            }
                          } as any)}
                          placeholder="مثال: 16 GB RAM"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>كرت الشاشة</FormLabel>
                        <Input
                          name="recommended.graphics"
                          value={formData.systemRequirements.recommended.graphics}
                          onChange={(e) => handleInputChange({
                            target: {
                              name: 'systemRequirements',
                              value: {
                                ...formData.systemRequirements,
                                recommended: {
                                  ...formData.systemRequirements.recommended,
                                  graphics: e.target.value
                                }
                              }
                            }
                          } as any)}
                          placeholder="مثال: NVIDIA RTX 3060"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>مساحة التخزين</FormLabel>
                        <Input
                          name="recommended.storage"
                          value={formData.systemRequirements.recommended.storage}
                          onChange={(e) => handleInputChange({
                            target: {
                              name: 'systemRequirements',
                              value: {
                                ...formData.systemRequirements,
                                recommended: {
                                  ...formData.systemRequirements.recommended,
                                  storage: e.target.value
                                }
                              }
                            }
                          } as any)}
                          placeholder="مثال: 100 GB"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </Box>
                </VStack>
              </Box>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="full"
                isLoading={loading}
              >
                نشر اللعبة
              </Button>
            </VStack>
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default CreateGame; 