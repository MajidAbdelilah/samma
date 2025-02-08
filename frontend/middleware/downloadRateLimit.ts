import rateLimit from 'express-rate-limit';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export const downloadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 downloads per windowMs
  message: { error: 'Too many download attempts, please try again later' },
  keyGenerator: (req: NextApiRequest) => {
    // Use both IP and user ID (if available) for rate limiting
    const token = req.headers.authorization?.substring(7);
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
          userId: string;
        };
        return `${req.socket.remoteAddress}-${decoded.userId}`;
      } catch (error) {
        // If token is invalid, fall back to IP-only
        return req.socket.remoteAddress!;
      }
    }
    return req.socket.remoteAddress!;
  },
}); 