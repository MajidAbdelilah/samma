import { Box, useToken } from '@chakra-ui/react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { GameStats } from '../../types/analytics';

ChartJS.register(ArcElement, Tooltip, Legend);

interface RevenueBreakdownChartProps {
  games: GameStats[];
}

const RevenueBreakdownChart: React.FC<RevenueBreakdownChartProps> = ({ games }) => {
  const [
    primary500,
    green500,
    blue500,
    yellow500,
    purple500,
    red500,
    orange500,
  ] = useToken('colors', [
    'primary.500',
    'green.500',
    'blue.500',
    'yellow.500',
    'purple.500',
    'red.500',
    'orange.500',
  ]);

  const colors = [
    primary500,
    green500,
    blue500,
    yellow500,
    purple500,
    red500,
    orange500,
  ];

  const totalRevenue = games.reduce((sum, game) => sum + game.revenue, 0);
  const otherThreshold = totalRevenue * 0.05; // Games with less than 5% of total revenue go to "Other"

  const mainGames = games.filter((game) => game.revenue >= otherThreshold);
  const otherGames = games.filter((game) => game.revenue < otherThreshold);
  const otherRevenue = otherGames.reduce((sum, game) => sum + game.revenue, 0);

  const data = {
    labels: [...mainGames.map((game) => game.title), otherGames.length > 0 ? 'أخرى' : null].filter(Boolean),
    datasets: [
      {
        data: [...mainGames.map((game) => game.revenue), otherGames.length > 0 ? otherRevenue : null].filter(Boolean),
        backgroundColor: colors,
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        rtl: true,
        labels: {
          font: {
            family: 'var(--font-family)',
          },
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets[0];
            const total = datasets.data.reduce((sum: number, value: number) => sum + value, 0);
            
            return chart.data.labels.map((label: string, i: number) => ({
              text: `${label} (${((datasets.data[i] / total) * 100).toFixed(1)}%)`,
              fillStyle: datasets.backgroundColor[i],
              hidden: false,
              index: i,
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = ((value / totalRevenue) * 100).toFixed(1);
            const formattedValue = new Intl.NumberFormat('ar-SA', {
              style: 'currency',
              currency: 'SAR',
            }).format(value);
            return `${context.label}: ${formattedValue} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Box p={4} borderWidth={1} borderRadius="lg" bg="white">
      <Doughnut data={data} options={options} />
    </Box>
  );
};

export default RevenueBreakdownChart; 