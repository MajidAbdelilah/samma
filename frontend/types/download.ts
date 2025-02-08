export interface GameDownload {
  id: string;
  gameId: string;
  version: string;
  fileSize: number;
  downloadUrl: string;
  expiresAt: string;
  downloadCount: number;
}

export interface DownloadToken {
  token: string;
  expiresAt: string;
} 