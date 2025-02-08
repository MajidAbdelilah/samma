import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  Progress,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { GameStats } from '../../types/analytics';

interface GamePerformanceTableProps {
  games: GameStats[];
  isLoading?: boolean;
}

const GamePerformanceTable: React.FC<GamePerformanceTableProps> = ({
  games,
  isLoading = false,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const maxRevenue = Math.max(...games.map((game) => game.revenue));
  const maxDownloads = Math.max(...games.map((game) => game.downloads));

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>اللعبة</Th>
            <Th isNumeric>الإيرادات</Th>
            <Th isNumeric>المبيعات</Th>
            <Th isNumeric>التقييم</Th>
            <Th isNumeric>التحميلات</Th>
            <Th>الأداء</Th>
          </Tr>
        </Thead>
        <Tbody>
          {games.map((game) => (
            <Tr key={game.id}>
              <Td fontWeight="medium">{game.title}</Td>
              <Td isNumeric>{formatCurrency(game.revenue)}</Td>
              <Td isNumeric>{game.sales}</Td>
              <Td isNumeric>
                <HStack justify="flex-end" spacing={1}>
                  <Text>{game.rating.toFixed(1)}</Text>
                  <Text color="gray.500">/10</Text>
                </HStack>
              </Td>
              <Td isNumeric>{game.downloads}</Td>
              <Td>
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      الإيرادات
                    </Text>
                    <Progress
                      value={(game.revenue / maxRevenue) * 100}
                      size="sm"
                      width="120px"
                      colorScheme="green"
                      rounded="full"
                    />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      التحميلات
                    </Text>
                    <Progress
                      value={(game.downloads / maxDownloads) * 100}
                      size="sm"
                      width="120px"
                      colorScheme="blue"
                      rounded="full"
                    />
                  </HStack>
                </VStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default GamePerformanceTable; 