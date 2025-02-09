import { useEffect } from 'react';
import {
  VStack,
  SimpleGrid,
  Box,
  Heading,
  Text,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useAnalytics } from '../../hooks/useAnalytics';
import StatCard from './StatCard';
import AnalyticsChart from './AnalyticsChart';
import AnalyticsFilters from './AnalyticsFilters';
import GamePerformanceTable from './GamePerformanceTable';
import RevenueBreakdownChart from './RevenueBreakdownChart';

interface AnalyticsDashboardProps {
  games: Array<{ id: string; title: string }>;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ games }) => {
  const {
    stats,
    salesData,
    ratingData,
    topGames,
    isLoading,
    error,
    fetchAnalytics,
  } = useAnalytics();

  useEffect(() => {
    fetchAnalytics({ period: 'month' });
  }, [fetchAnalytics]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(value);

  if (error) {
    return (
      <Center py={8}>
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="lg" mb={6}>
          لوحة التحليلات
        </Heading>
        <AnalyticsFilters
          games={games}
          onFilterChange={fetchAnalytics}
        />
      </Box>

      {isLoading ? (
        <Center py={8}>
          <Spinner size="xl" color="primary.500" />
        </Center>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <StatCard
              label="إجمالي الإيرادات"
              value={stats?.total_revenue || 0}
              format={formatCurrency}
            />
            <StatCard
              label="إجمالي المبيعات"
              value={stats?.total_sales || 0}
            />
            <StatCard
              label="متوسط التقييم"
              value={stats?.average_rating ? Number(stats.average_rating).toFixed(1) : '0.0'}
            />
            <StatCard
              label="عمولة المنصة"
              value={stats?.platform_fees || 0}
              format={formatCurrency}
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Box>
              <Heading size="md" mb={4}>
                توزيع الإيرادات
              </Heading>
              <RevenueBreakdownChart games={topGames} />
            </Box>
            <Box>
              <Heading size="md" mb={4}>
                المبيعات والإيرادات
              </Heading>
              <AnalyticsChart
                title="المبيعات والإيرادات"
                labels={salesData.map((d) => d.date)}
                datasets={[
                  {
                    label: 'الإيرادات',
                    data: salesData.map((d) => d.revenue),
                    borderColor: 'green.500',
                  },
                  {
                    label: 'المبيعات',
                    data: salesData.map((d) => d.sales),
                    borderColor: 'blue.500',
                  },
                ]}
              />
            </Box>
          </SimpleGrid>

          <Box>
            <Heading size="md" mb={4}>
              التقييمات
            </Heading>
            <AnalyticsChart
              title="التقييمات"
              labels={ratingData.map((d) => d.title)}
              datasets={[
                {
                  label: 'التقييم',
                  data: ratingData.map((d) => d.rating),
                  borderColor: 'yellow.500',
                },
                {
                  label: 'عدد التقييمات',
                  data: ratingData.map((d) => d.total_ratings),
                  borderColor: 'purple.500',
                },
              ]}
            />
          </Box>

          <Box>
            <Heading size="md" mb={4}>
              أداء الألعاب
            </Heading>
            <GamePerformanceTable games={topGames.map(game => ({
              ...game,
              downloads: game.sales // Use sales as downloads since we don't track downloads separately
            }))} />
          </Box>
        </>
      )}
    </VStack>
  );
};

export default AnalyticsDashboard; 