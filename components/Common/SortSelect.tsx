import { Select, FormControl, FormLabel } from '@chakra-ui/react';

interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
  label?: string;
}

const SortSelect: React.FC<SortSelectProps> = ({
  value,
  onChange,
  options,
  label = 'ترتيب حسب',
}) => {
  return (
    <FormControl>
      <FormLabel fontSize="sm">{label}</FormLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default SortSelect; 