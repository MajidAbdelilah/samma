import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { createApi } from '@/utils/api';
import { GameVersion } from '@/types';

interface GameVersionManagementProps {
  gameId: number;
  onVersionUpdate: () => void;
}

const GameVersionManagement: React.FC<GameVersionManagementProps> = ({ gameId, onVersionUpdate }) => {
  const [versions, setVersions] = useState<GameVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const api = createApi((message) => {
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  });

  const fetchVersions = async () => {
    try {
      const response = await api.get(`/games/${gameId}/versions/`);
      if (response.error) {
        throw response.error;
      }
      setVersions(response.data.results);
    } catch (error) {
      console.error('Error fetching versions:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [gameId]);

  const handleDelete = async (versionId: number) => {
    try {
      await api.delete(`/games/${gameId}/versions/${versionId}/`);
      await fetchVersions();
      onVersionUpdate();
      toast({
        title: 'Success',
        description: 'Version deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting version:', error);
      throw error; // Re-throw to propagate to test
    }
  };
  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Version</Th>
            <Th>Release Date</Th>
            <Th>Release Notes</Th>
            <Th>File Size</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {versions.map((version) => (
            <Tr key={version.id}>
              <Td>{version.version}</Td>
              <Td>{new Date(version.created_at).toLocaleDateString()}</Td>
              <Td>{version.release_notes}</Td>
              <Td>{Math.round(version.file_size / 1024 / 1024)} MB</Td>
              <Td>
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={() => handleDelete(version.id)}
                  isDisabled={version.is_active}
                >
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default GameVersionManagement;
