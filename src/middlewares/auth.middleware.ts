import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

declare global {
  namespace Express {
    interface Request {
      decoded?: any; // You can specify a more accurate type based on your needs
    }
  }
}

// JWT authentication middleware
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Auth token is not supplied or invalid format' });
    return; // Stop further execution
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, decoded) => {
    if (err) {
      res.status(401).json({ message: 'Invalid token' });
    } else {
      req.decoded = decoded; // Save decoded token in request
      next(); // Move to the next middleware/route handler
    }
  });
};

export default authMiddleware;
