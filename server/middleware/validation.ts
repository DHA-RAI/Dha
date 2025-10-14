import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function validateRequest(req: Request, res: Response, next: NextFunction) {
  try {
    // Add your validation logic here
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
}