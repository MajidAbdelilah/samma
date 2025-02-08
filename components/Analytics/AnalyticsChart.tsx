import { Box, useToken } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Dataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
}

interface AnalyticsChartProps {
  title: string;
  labels: string[];
  datasets: Dataset[];
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  labels,
  datasets,
}) => {
  const [primary500] = useToken('colors', ['primary.500']);

  const data: ChartData<'line'> = {
    labels,
    datasets: datasets.map((dataset) => ({
      ...dataset,
      borderColor: dataset.borderColor || primary500,
      backgroundColor: dataset.backgroundColor || primary500,
      tension: 0.4,
    })),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box p={4} borderWidth={1} borderRadius="lg" bg="white">
      <Line data={data} options={options} />
    </Box>
  );
};

export default AnalyticsChart; 