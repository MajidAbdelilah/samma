import type { NextPage } from 'next';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  VStack,
  HStack,
  Image,
  useColorModeValue,
  Flex,
  Icon,
  Link as ChakraLink,
  Card,
  CardBody,
  Badge,
  Skeleton,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaGamepad, FaSearch, FaShoppingCart, FaStar } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

interface Game {
  id: number;
  title: string;
  price: number;
  rating: number;
  main_image: string;
  seller: {
    username: string;
  };
}

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
}

const Feature = ({ icon, title, text }: { icon: any; title: string; text: string }) => {
  return (
    <VStack
      align="center"
      p={6}
      bg={useColorModeValue('white', 'gray.800')}
      rounded="xl"
      shadow="md"
      borderWidth="1px"
      spacing={4}
    >
      <Icon as={icon} w={10} h={10} color="blue.500" />
      <Text fontWeight="bold" fontSize="xl" textAlign="center">
        {title}
      </Text>
      <Text textAlign="center" color={useColorModeValue('gray.600', 'gray.300')}>
        {text}
      </Text>
    </VStack>
  );
};

const GameCard: React.FC<{ game: Game }> = ({ game }) => {
  const rating = typeof game.rating === 'number' ? game.rating : 0;
  
  return (
    <Card>
      <CardBody>
        <Image
          src={game.main_image || '/images/game-placeholder.svg'}
          alt={game.title}
          borderRadius="lg"
          mb={4}
          height="200px"
          width="100%"
          objectFit="cover"
        />
        <VStack align="start" spacing={2}>
          <Heading size="md">{game.title}</Heading>
          <Text color="gray.500">{game.seller.username}</Text>
          <HStack justify="space-between" width="100%">
            <Badge colorScheme="blue">${game.price.toFixed(2)}</Badge>
            <HStack>
              <Icon as={FaStar} color="yellow.400" />
              <Text>{rating.toFixed(1)}</Text>
            </HStack>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

const Home: NextPage = () => {
  const { isAuthenticated } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured games
        const gamesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/games/top-games/?metric=rating`, {
          credentials: 'include',
        });
        const gamesData = await gamesResponse.json();
        setFeaturedGames(Array.isArray(gamesData) ? gamesData : gamesData.results || []);

        // Fetch categories
        const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/games/categories/`, {
          credentials: 'include',
        });
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.results || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <Box bg={bgColor} py={20}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <VStack align="flex-start" spacing={6}>
              <Heading as="h1" size="2xl">
                متجر الألعاب الرقمية العربي الأول
              </Heading>
              <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.300')}>
                اكتشف مجموعة واسعة من الألعاب الرقمية بأسعار تنافسية
              </Text>
              <HStack spacing={4}>
                {!isAuthenticated ? (
                  <>
                    <Button
                      as={NextLink}
                      href="/register"
                      colorScheme="blue"
                      size="lg"
                    >
                      سجل الآن
                    </Button>
                    <Button
                      as={NextLink}
                      href="/login"
                      variant="outline"
                      size="lg"
                    >
                      تسجيل الدخول
                    </Button>
                  </>
                ) : (
                  <Button
                    as={NextLink}
                    href="/games"
                    colorScheme="blue"
                    size="lg"
                  >
                    اكتشف الألعاب
                  </Button>
                )}
              </HStack>
            </VStack>
            <Flex justify="center">
              <Image
                src="/logo.svg"
                alt="Samma Store Logo"
                width={400}
                height={400}
                objectFit="contain"
              />
            </Flex>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Featured Games Section */}
      <Container maxW="container.xl" py={20}>
        <Heading mb={8}>الألعاب المميزة</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} height="400px" />
            ))
          ) : featuredGames.length > 0 ? (
            featuredGames.map((game) => (
              <Box 
                key={game.id} 
                as="a" 
                href={`/games/${game.id}`}
                _hover={{ textDecoration: 'none' }}
              >
                <GameCard game={game} />
              </Box>
            ))
          ) : (
            <Text>لا توجد ألعاب مميزة حالياً</Text>
          )}
        </SimpleGrid>
      </Container>

      {/* Features Section */}
      <Container maxW="container.xl" py={20}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          <Feature
            icon={FaGamepad}
            title="مجموعة متنوعة"
            text="آلاف الألعاب من مختلف الفئات والتصنيفات"
          />
          <Feature
            icon={FaShoppingCart}
            title="شراء آمن"
            text="دفع آمن وسريع مع دعم متعدد طرق الدفع"
          />
          <Feature
            icon={FaStar}
            title="تقييمات موثوقة"
            text="تقييمات وآراء حقيقية من مجتمع اللاعبين"
          />
        </SimpleGrid>
      </Container>

      {/* Categories Section */}
      <Container maxW="container.xl" py={20}>
        <Heading mb={8}>التصنيفات</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} height="200px" />
            ))
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <Box
                key={category.id}
                as="a"
                href={`/games/category/${category.id}`}
                _hover={{ transform: 'translateY(-4px)', transition: '0.2s', textDecoration: 'none' }}
              >
                <Card>
                  <CardBody>
                    <VStack spacing={4}>
                      <Image
                        src={category.icon || '/images/category-placeholder.svg'}
                        alt={category.name}
                        width={64}
                        height={64}
                      />
                      <Heading size="md">{category.name}</Heading>
                      <Text noOfLines={2} textAlign="center">
                        {category.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </Box>
            ))
          ) : (
            <Text>لا توجد تصنيفات متاحة حالياً</Text>
          )}
        </SimpleGrid>
      </Container>
    </MainLayout>
  );
};

export default Home; 