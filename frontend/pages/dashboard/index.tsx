import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  useToast,
  Card,
  CardBody,
  SimpleGrid,
  Text,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import MainLayout from '../../components/Layout/MainLayout';

interface UserStats {
  total_games: number;
  total_sales: number;
  average_rating: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user statistics
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounts/statistics/`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch statistics');
        }
        
        const statsData = await statsResponse.json();
        setUserStats(statsData);

        // Fetch user's games
        const gamesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounts/my-games/`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (!gamesResponse.ok) {
          throw new Error('Failed to fetch games');
        }
        
        const gamesData = await gamesResponse.json();
        setGames(gamesData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch dashboard data',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const formatNumber = (value: number | null | undefined, decimals: number = 2): string => {
    if (typeof value !== 'number') return '0.' + '0'.repeat(decimals);
    return value.toFixed(decimals);
  };

  const formatRating = (rating: number | null | undefined): string => {
    return formatNumber(rating, 1);
  };

  const formatPrice = (price: number | null | undefined): string => {
    return `$${formatNumber(price, 2)}`;
  };

  if (loading) {
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
        <Box mb={8}>
          <Heading mb={6}>لوحة التحكم</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>إجمالي المبيعات</StatLabel>
                  <StatNumber>{formatPrice(userStats?.total_sales)}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>الألعاب المنشورة</StatLabel>
                  <StatNumber>{userStats?.total_games || 0}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>متوسط التقييم</StatLabel>
                  <StatNumber>{formatRating(userStats?.average_rating)}/5</StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>سجل المشتريات</Heading>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>اسم اللعبة</Th>
                    <Th>السعر</Th>
                    <Th>التقييم</Th>
                    <Th>التحميلات</Th>
                    <Th>الإجراءات</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {games.length > 0 ? (
                    games.map((game: any) => (
                      <Tr key={game.id}>
                        <Td>{game.title}</Td>
                        <Td>{formatPrice(game.price)}</Td>
                        <Td>{formatRating(game.rating)}/5</Td>
                        <Td>{game.downloads || 0}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => router.push(`/games/${game.id}/edit`)}
                            >
                              تعديل
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                            >
                              حذف
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={5}>
                        <Text textAlign="center">لا توجد ألعاب منشورة</Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </Container>
    </MainLayout>
  );
};

export default Dashboard; 