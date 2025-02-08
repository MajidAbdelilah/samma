import { useState } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Badge,
  useToast,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { FiDownload, FiTrash2 } from 'react-icons/fi';
import { GameVersion } from '../../types';

interface GameVersionsProps {
  gameId: string;
  versions: GameVersion[];
  onVersionDelete?: (versionId: string) => void;
}

const GameVersions: React.FC<GameVersionsProps> = ({
  gameId,
  versions,
  onVersionDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const toast = useToast();

  const handleDelete = async (versionId: string) => {
    setIsDeleting(versionId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/games/${gameId}/versions/${versionId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete version');

      toast({
        title: 'تم حذف الإصدار بنجاح',
        status: 'success',
        duration: 3000,
      });

      onVersionDelete?.(versionId);
    } catch (error) {
      toast({
        title: 'فشل حذف الإصدار',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>الإصدار</Th>
            <Th>تاريخ الرفع</Th>
            <Th>حجم الملف</Th>
            <Th>عدد التحميلات</Th>
            <Th>الحالة</Th>
            <Th>الإجراءات</Th>
          </Tr>
        </Thead>
        <Tbody>
          {versions.map((version) => (
            <Tr key={version.id}>
              <Td>
                <Text fontWeight="bold">{version.version}</Text>
                {version.notes && (
                  <Text fontSize="sm" color="gray.600">
                    {version.notes}
                  </Text>
                )}
              </Td>
              <Td>{formatDate(version.uploadedAt)}</Td>
              <Td>{formatFileSize(version.fileSize)}</Td>
              <Td>{version.downloadCount}</Td>
              <Td>
                <Badge
                  colorScheme={version.isActive ? 'green' : 'gray'}
                  variant="subtle"
                >
                  {version.isActive ? 'نشط' : 'غير نشط'}
                </Badge>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    leftIcon={<Icon as={FiDownload} />}
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => window.open(version.downloadUrl)}
                  >
                    تحميل
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<Icon as={FiTrash2} />}
                    variant="ghost"
                    colorScheme="red"
                    isLoading={isDeleting === version.id}
                    onClick={() => handleDelete(version.id)}
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
  );
};

export default GameVersions; 