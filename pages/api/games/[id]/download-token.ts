import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { getSession } from 'next-auth/react';

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id: gameId } = req.query;

    // Check if user has purchased the game
    const hasPurchased = await checkGamePurchase(session.user.id, gameId as string);
    if (!hasPurchased) {
      return res.status(403).json({ error: 'Game not purchased' });
    }

    // Generate download token
    const token = jwt.sign(
      {
        userId: session.user.id,
        gameId,
        type: 'download',
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Download token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function checkGamePurchase(userId: string, gameId: string): Promise<boolean> {
  // Implement your database check here
  // This is a placeholder implementation
  return true;
} 