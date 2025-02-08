import { useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Icon,
  Progress,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { FaDownload, FaCheckCircle } from 'react-icons/fa';
import { GameDownload } from '../../types/download';

interface GameDownloadProps {
  gameId: string;
  isPurchased: boolean;
  onDownloadComplete?: () => void;
}

const GameDownload: React.FC<GameDownloadProps> = ({
  gameId,
  isPurchased,
  onDownloadComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadInfo, setDownloadInfo] = useState<GameDownload | null>(null);
  const toast = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDownloadToken = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}/download-token`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to get download token');
      return await response.json();
    } catch (error) {
      throw new Error('Could not generate download token');
    }
  };

  const startDownload = async () => {
    if (!isPurchased) {
      toast({
        title: 'يجب شراء اللعبة أولاً',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get download info from Python backend
      const infoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games/${gameId}/download-info`);
      if (!infoResponse.ok) throw new Error('Failed to get download info');
      const downloadInfo = await infoResponse.json();
      setDownloadInfo(downloadInfo);

      // Start download with progress tracking
      const downloadResponse = await fetch(downloadInfo.downloadUrl);
      if (!downloadResponse.ok) throw new Error('Download failed');

      const reader = downloadResponse.body?.getReader();
      const contentLength = +(downloadResponse.headers.get('Content-Length') ?? 0);
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        receivedLength += value.length;
        const progress = (receivedLength / contentLength) * 100;
        setDownloadProgress(progress);
      }

      // Download complete
      toast({
        title: 'تم تحميل اللعبة بنجاح',
        status: 'success',
        duration: 3000,
      });
      onDownloadComplete?.();
    } catch (error) {
      toast({
        title: 'فشل تحميل اللعبة',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <Box p={4} borderWidth={1} rounded="lg" shadow="sm">
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="bold">تحميل اللعبة</Text>
          {downloadInfo && (
            <Badge colorScheme="blue">
              الإصدار {downloadInfo.version}
            </Badge>
          )}
        </HStack>

        {downloadInfo && (
          <Text fontSize="sm" color="gray.600">
            حجم الملف: {formatFileSize(downloadInfo.fileSize)}
          </Text>
        )}

        {downloadProgress > 0 && (
          <Box>
            <Progress
              value={downloadProgress}
              size="sm"
              colorScheme="blue"
              rounded="full"
              mb={2}
            />
            <Text fontSize="sm" textAlign="center">
              {downloadProgress.toFixed(1)}%
            </Text>
          </Box>
        )}

        <Button
          leftIcon={downloadProgress === 100 ? <Icon as={FaCheckCircle} /> : <Icon as={FaDownload} />}
          colorScheme={downloadProgress === 100 ? 'green' : 'blue'}
          onClick={startDownload}
          isLoading={isLoading}
          isDisabled={!isPurchased || downloadProgress === 100}
        >
          {!isPurchased
            ? 'يجب شراء اللعبة أولاً'
            : downloadProgress === 100
            ? 'تم التحميل'
            : 'تحميل اللعبة'}
        </Button>

        {!isPurchased && (
          <Text fontSize="sm" color="red.500">
            * يجب شراء اللعبة قبل تحميلها
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default GameDownload; 