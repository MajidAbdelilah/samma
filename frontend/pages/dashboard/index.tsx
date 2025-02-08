import React from 'react';
import {
  Box,
  Container,
  Grid,
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
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import MainLayout from '../../components/Layout/MainLayout';
import { Game } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';

interface SalesData {
  totalSales: number;
  monthlyRevenue: number;
  totalDownloads: number;
}

interface PurchaseHistory {
  id: string;
  gameId: string;
  gameName: string;
  price: number;
  purchaseDate: string;
}

interface DashboardProps {
  publishedGames: Game[];
  salesData: SalesData;
  purchaseHistory: PurchaseHistory[];
}

const Dashboard: React.FC<DashboardProps> = ({
  publishedGames,
  salesData,
  purchaseHistory,
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleEditGame = (gameId: string) => {
    router.push(`/games/${gameId}/edit`);
  };

  const handleDeleteGame = async (gameId: string) => {
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete game');

      toast({
        title: 'تم حذف اللعبة بنجاح',
        status: 'success',
        duration: 3000,
      });
      
      router.reload();
    } catch (error) {
      toast({
        title: 'فشل حذف اللعبة',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <MainLayout>
      <Container maxW="container.xl" py={8}>
        <Heading mb={6}>لوحة التحكم</Heading>

        <StatGroup mb={8}>
          <Stat>
            <StatLabel>إجمالي المبيعات</StatLabel>
            <StatNumber>${salesData.totalSales}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>الإيرادات الشهرية</StatLabel>
            <StatNumber>${salesData.monthlyRevenue}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>إجمالي التحميلات</StatLabel>
            <StatNumber>{salesData.totalDownloads}</StatNumber>
          </Stat>
        </StatGroup>

        <Tabs colorScheme="primary">
          <TabList>
            <Tab>الألعاب المنشورة</Tab>
            <Tab>سجل المشتريات</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>اسم اللعبة</Th>
                      <Th>السعر</Th>
                      <Th>التقييم</Th>
                      <Th>نسبة العمولة</Th>
                      <Th>التحميلات</Th>
                      <Th>الإجراءات</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {publishedGames.map((game) => (
                      <Tr key={game.id}>
                        <Td>{game.title}</Td>
                        <Td>${game.price}</Td>
                        <Td>{game.rating}/10</Td>
                        <Td>{game.bidPercentage}%</Td>
                        <Td>{game.commentCount}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              colorScheme="primary"
                              onClick={() => handleEditGame(game.id)}
                            >
                              تعديل
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDeleteGame(game.id)}
                            >
                              حذف
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>اسم اللعبة</Th>
                      <Th>السعر</Th>
                      <Th>تاريخ الشراء</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {purchaseHistory.map((purchase) => (
                      <Tr key={purchase.id}>
                        <Td>{purchase.gameName}</Td>
                        <Td>${purchase.price}</Td>
                        <Td>
                          {new Date(purchase.purchaseDate).toLocaleDateString(
                            'ar-SA'
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </MainLayout>
  );
};

export const getServerSideProps: GetServerSideProps<DashboardProps> = async () => {
  // Mock data with proper types
  const mockData: DashboardProps = {
    publishedGames: [
      {
        id: '1',
        title: 'عنوان اللعبة',
        description: 'وصف اللعبة',
        price: 29.99,
        rating: 8.5,
        bidPercentage: 15,
        commentCount: 42,
        thumbnailUrl: '/game-thumbnail.jpg',
        categories: ['action'],
        tags: ['action', 'adventure'],
        seller: {
          id: '123',
          name: 'المطور',
        },
      },
    ],
    salesData: {
      totalSales: 1500,
      monthlyRevenue: 500,
      totalDownloads: 100,
    },
    purchaseHistory: [
      {
        id: '1',
        gameId: '1',
        gameName: 'اسم اللعبة',
        price: 29.99,
        purchaseDate: '2024-01-01',
      },
    ],
  };

  return {
    props: mockData,
  };
};

export default Dashboard; 