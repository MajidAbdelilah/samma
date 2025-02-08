import { useState, useRef } from 'react';
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Progress,
  Text,
  Box,
  useToast,
  FormErrorMessage,
  Icon,
} from '@chakra-ui/react';
import { FiUpload, FiFile } from 'react-icons/fi';
import axios, { AxiosProgressEvent } from 'axios';

interface GameUploadFormProps {
  gameId: string;
  onUploadComplete?: () => void;
}

interface UploadValidation {
  isValid: boolean;
  error?: string;
}

const GameUploadForm: React.FC<GameUploadFormProps> = ({
  gameId,
  onUploadComplete,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const validateFile = (file: File): UploadValidation => {
    const maxSize = 1024 * 1024 * 500; // 500MB
    const allowedTypes = ['application/zip', 'application/x-zip-compressed'];

    if (!file) {
      return { isValid: false, error: 'يرجى اختيار ملف' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'يجب أن يكون الملف بصيغة ZIP' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'حجم الملف يجب أن لا يتجاوز 500 ميجابايت' };
    }

    return { isValid: true };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.isValid) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError(validation.error || null);
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/games/${gameId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const progress = progressEvent.total ? (progressEvent.loaded / progressEvent.total) * 100 : 0;
            setUploadProgress(progress);
          },
        }
      );

      if (response.status !== 200) throw new Error('فشل رفع الملف');

      toast({
        title: 'تم رفع الملف بنجاح',
        status: 'success',
        duration: 3000,
      });

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadComplete?.();
    } catch (error) {
      toast({
        title: 'فشل رفع الملف',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl isInvalid={!!error}>
        <FormLabel htmlFor="file-input">ملف اللعبة (ZIP)</FormLabel>
        <Input
          id="file-input"
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          ref={fileInputRef}
          display="none"
          data-testid="file-input"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          leftIcon={<Icon as={FiUpload} />}
          isDisabled={isUploading}
          w="full"
        >
          اختر ملف
        </Button>
        <FormErrorMessage>{error}</FormErrorMessage>
      </FormControl>

      {selectedFile && (
        <Box p={4} borderWidth={1} borderRadius="md">
          <HStack>
            <Icon as={FiFile} />
            <Text>{selectedFile.name}</Text>
            <Text color="gray.500" fontSize="sm">
              ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </Text>
          </HStack>
          {uploadProgress > 0 && (
            <Progress value={uploadProgress} size="sm" mt={2} />
          )}
          <Button
            mt={4}
            colorScheme="blue"
            onClick={handleUpload}
            isDisabled={isUploading}
            isLoading={isUploading}
            loadingText="جاري الرفع..."
            w="full"
          >
            رفع الملف
          </Button>
        </Box>
      )}
    </VStack>
  );
};

export default GameUploadForm; 