import { useState } from 'react';
import { GameDownload } from '../types/download';

interface UseGameDownloadResult {
  downloadInfo: GameDownload | null;
  isLoading: boolean;
  progress: number;
  error: string | null;
  startDownload: () => Promise<void>;
  cancelDownload: () => void;
}

export const useGameDownload = (gameId: string): UseGameDownloadResult => {
  const [downloadInfo, setDownloadInfo] = useState<GameDownload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const startDownload = async () => {
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Get download info from Python backend
      const infoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games/${gameId}/download-info`);
      if (!infoResponse.ok) throw new Error('Failed to get download info');
      const info = await infoResponse.json();
      setDownloadInfo(info);

      // Start download with progress tracking
      const downloadResponse = await fetch(info.downloadUrl, {
        signal: controller.signal,
      });

      if (!downloadResponse.ok) throw new Error('Download failed');

      const reader = downloadResponse.body?.getReader();
      const contentLength = +(downloadResponse.headers.get('Content-Length') ?? 0);
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        receivedLength += value.length;
        setProgress((receivedLength / contentLength) * 100);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const cancelDownload = () => {
    if (abortController) {
      abortController.abort();
      setProgress(0);
      setIsLoading(false);
      setError('Download cancelled');
    }
  };

  return {
    downloadInfo,
    isLoading,
    progress,
    error,
    startDownload,
    cancelDownload,
  };
}; 