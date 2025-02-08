import { Box, Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  format?: (value: number) => string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, format }) => {
  const formattedValue = typeof value === 'number' && format ? format(value) : value;

  return (
    <Box p={4} borderWidth={1} borderRadius="lg" bg="white">
      <Stat>
        <StatLabel fontSize="sm" color="gray.600">{label}</StatLabel>
        <StatNumber fontSize="2xl">{formattedValue}</StatNumber>
        {change !== undefined && (
          <StatHelpText>
            <StatArrow type={change >= 0 ? 'increase' : 'decrease'} />
            {Math.abs(change)}%
          </StatHelpText>
        )}
      </Stat>
    </Box>
  );
};

export default StatCard; 