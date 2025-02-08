import { useState, useRef } from 'react';
import axios from 'axios';

interface UseGameUploadResult {
  selectedFile: File | null;
  uploadProgress: number;
  isUploading: boolean;
  error: string | null;
  handleFileSelect: (file: File) => void;
  handleUpload: () => Promise<void>;
  resetUpload: () => void;
}

export const useGameUpload = (
  gameId: string,
  onUploadComplete?: () => void
): UseGameUploadResult => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
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

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    if (validation.isValid) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError(validation.error || 'Invalid file');
      setSelectedFile(null);
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
          onUploadProgress: (progressEvent: ProgressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total!) * 100;
            setUploadProgress(progress);
          },
        }
      );

      if (response.status !== 200) throw new Error('Upload failed');

      onUploadComplete?.();
      resetUpload();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setError(null);
  };

  return {
    selectedFile,
    uploadProgress,
    isUploading,
    error,
    handleFileSelect,
    handleUpload,
    resetUpload,
  };
}; 