import express from 'express';
import { validateRequest } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Protected routes
router.use(authenticateToken);

// Document endpoints
router.get('/documents', validateRequest, async (req, res) => {
  res.json({ documents: [] });
});

export default router;