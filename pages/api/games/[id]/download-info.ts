import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        gameId: string;
        type: string;
      };
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (decoded.type !== 'download' || decoded.gameId !== req.query.id) {
      return res.status(403).json({ error: 'Invalid token for this game' });
    }

    // Get game download info from your database
    const downloadInfo = await getGameDownloadInfo(decoded.gameId);
    if (!downloadInfo) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.status(200).json(downloadInfo);
  } catch (error) {
    console.error('Download info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getGameDownloadInfo(gameId: string) {
  // Implement your database query here
  // This is a placeholder implementation
  return {
    id: 'download-1',
    gameId,
    version: '1.0.0',
    fileSize: 1024 * 1024 * 100, // 100MB
    downloadUrl: `/api/games/${gameId}/download`,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    downloadCount: 0,
  };
} 