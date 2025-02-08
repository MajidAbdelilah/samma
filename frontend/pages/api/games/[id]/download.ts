import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { createReadStream } from 'fs';
import { join } from 'path';

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

    // Get game file path from your database
    const filePath = await getGameFilePath(decoded.gameId);
    if (!filePath) {
      return res.status(404).json({ error: 'Game file not found' });
    }

    // Set appropriate headers
    const fileName = `game-${decoded.gameId}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream the file
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);

    // Update download count
    await updateDownloadCount(decoded.gameId);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getGameFilePath(gameId: string): Promise<string> {
  // Implement your database query here
  // This is a placeholder implementation
  return join(process.cwd(), 'uploads', 'games', `${gameId}.zip`);
}

async function updateDownloadCount(gameId: string): Promise<void> {
  // Implement your database update here
  // This is a placeholder implementation
} 