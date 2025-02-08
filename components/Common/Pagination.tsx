import { HStack, Button, Text } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.slice(
    Math.max(0, currentPage - 2),
    Math.min(totalPages, currentPage + 1)
  );

  return (
    <HStack spacing={2} justify="center" py={4}>
      <Button
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        leftIcon={<ChevronRightIcon />}
      >
        السابق
      </Button>

      {currentPage > 3 && (
        <>
          <Button size="sm" onClick={() => onPageChange(1)}>
            1
          </Button>
          <Text>...</Text>
        </>
      )}

      {showPages.map(page => (
        <Button
          key={page}
          size="sm"
          colorScheme={currentPage === page ? 'primary' : 'gray'}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      {currentPage < totalPages - 2 && (
        <>
          <Text>...</Text>
          <Button size="sm" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </Button>
        </>
      )}

      <Button
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        rightIcon={<ChevronLeftIcon />}
      >
        التالي
      </Button>
    </HStack>
  );
};

export default Pagination; 