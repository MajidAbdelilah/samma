import { useState } from 'react';
import {
  VStack,
  HStack,
  Select,
  Button,
  Input,
  FormControl,
  FormLabel,
  useDisclosure,
  Collapse,
} from '@chakra-ui/react';
import { AnalyticsFilter, AnalyticsPeriod } from '../../types/analytics';

interface AnalyticsFiltersProps {
  onFilterChange: (filter: AnalyticsFilter) => void;
  games?: Array<{ id: string; title: string }>;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  onFilterChange,
  games = [],
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const [filter, setFilter] = useState<AnalyticsFilter>({
    period: 'month',
  });
  const [customPeriod, setCustomPeriod] = useState<AnalyticsPeriod>({
    start: '',
    end: '',
  });

  const isDateRangeValid = () => {
    if (!customPeriod.start || !customPeriod.end) return false;
    return new Date(customPeriod.start) <= new Date(customPeriod.end);
  };

  const handlePeriodChange = (period: AnalyticsFilter['period']) => {
    const newFilter = { ...filter, period };
    if (period !== 'custom') {
      delete newFilter.customPeriod;
      setCustomPeriod({ start: '', end: '' });
    }
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleCustomPeriodChange = () => {
    if (!isDateRangeValid()) return;
    
    const newFilter = {
      ...filter,
      customPeriod,
    };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleGameChange = (gameId: string) => {
    const newFilter = {
      ...filter,
      gameId: gameId || undefined,
    };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack spacing={4}>
        <FormControl>
          <FormLabel id="period-select-label">الفترة الزمنية</FormLabel>
          <Select
            aria-labelledby="period-select-label"
            value={filter.period}
            onChange={(e) => handlePeriodChange(e.target.value as AnalyticsFilter['period'])}
          >
            <option value="day">اليوم</option>
            <option value="week">آخر أسبوع</option>
            <option value="month">آخر شهر</option>
            <option value="year">آخر سنة</option>
            <option value="custom">فترة مخصصة</option>
          </Select>
        </FormControl>

        {games.length > 0 && (
          <FormControl>
            <FormLabel id="game-select-label">اللعبة</FormLabel>
            <Select
              aria-labelledby="game-select-label"
              value={filter.gameId || ''}
              onChange={(e) => handleGameChange(e.target.value)}
            >
              <option value="">جميع الألعاب</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </Select>
          </FormControl>
        )}
      </HStack>

      <Collapse in={filter.period === 'custom'}>
        <HStack spacing={4}>
          <FormControl>
            <FormLabel htmlFor="start-date">من</FormLabel>
            <Input
              id="start-date"
              data-testid="start-date-input"
              type="date"
              aria-label="من"
              value={customPeriod.start}
              onChange={(e) =>
                setCustomPeriod({ ...customPeriod, start: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="end-date">إلى</FormLabel>
            <Input
              id="end-date"
              data-testid="end-date-input"
              type="date"
              aria-label="إلى"
              value={customPeriod.end}
              onChange={(e) =>
                setCustomPeriod({ ...customPeriod, end: e.target.value })
              }
            />
          </FormControl>

          <Button
            data-testid="apply-date-filter"
            alignSelf="flex-end"
            onClick={handleCustomPeriodChange}
            colorScheme="primary"
            isDisabled={!isDateRangeValid()}
          >
            تطبيق
          </Button>
        </HStack>
      </Collapse>
    </VStack>
  );
};

export default AnalyticsFilters; 