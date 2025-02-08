import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  VStack,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  totalRevenue: number;
  revenueChange: number;
  totalSales: number;
  salesChange: number;
  averageRating: number;
  ratingChange: number;
  dailyStats: {
    date: string;
    revenue: number;
    sales: number;
    ratings: number;
  }[];
}

interface GameAnalyticsProps {
  gameId: string;
}

const GameAnalytics: React.FC<GameAnalyticsProps> = ({ gameId }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const bgColor = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(
          `/api/games/${gameId}/analytics?range=${timeRange}`
        );
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, [gameId, timeRange]);

  if (!analyticsData) return null;

  const chartData = {
    labels: analyticsData.dailyStats.map(stat => 
      new Date(stat.date).toLocaleDateString('ar-SA')
    ),
    datasets: [
      {
        label: 'الإيرادات',
        data: analyticsData.dailyStats.map(stat => stat.revenue),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'المبيعات',
        data: analyticsData.dailyStats.map(stat => stat.sales),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'إحصائيات اللعبة',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <VStack spacing={6} w="full">
      <Box w="full" p={4}>
        <Heading size="md" mb={4}>تحليلات اللعبة</Heading>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
          mb={6}
          maxW="200px"
        >
          <option value="7d">آخر 7 أيام</option>
          <option value="30d">آخر 30 يوم</option>
          <option value="90d">آخر 90 يوم</option>
        </Select>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
          <Stat bg={bgColor} p={4} rounded="lg" shadow="sm">
            <StatLabel>إجمالي الإيرادات</StatLabel>
            <StatNumber>${analyticsData.totalRevenue}</StatNumber>
            <StatHelpText>
              <StatArrow
                type={analyticsData.revenueChange >= 0 ? 'increase' : 'decrease'}
              />
              {Math.abs(analyticsData.revenueChange)}%
            </StatHelpText>
          </Stat>

          <Stat bg={bgColor} p={4} rounded="lg" shadow="sm">
            <StatLabel>إجمالي المبيعات</StatLabel>
            <StatNumber>{analyticsData.totalSales}</StatNumber>
            <StatHelpText>
              <StatArrow
                type={analyticsData.salesChange >= 0 ? 'increase' : 'decrease'}
              />
              {Math.abs(analyticsData.salesChange)}%
            </StatHelpText>
          </Stat>

          <Stat bg={bgColor} p={4} rounded="lg" shadow="sm">
            <StatLabel>متوسط التقييم</StatLabel>
            <StatNumber>{analyticsData.averageRating.toFixed(1)}/10</StatNumber>
            <StatHelpText>
              <StatArrow
                type={analyticsData.ratingChange >= 0 ? 'increase' : 'decrease'}
              />
              {Math.abs(analyticsData.ratingChange)}%
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        <Box bg={bgColor} p={4} rounded="lg" shadow="sm">
          <Line data={chartData} options={chartOptions} />
        </Box>
      </Box>
    </VStack>
  );
};

export default GameAnalytics; 