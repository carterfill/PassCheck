import { Router } from 'express';
import { trackVisitor, getStats } from '../controllers/visitor.controller';

const router = Router();

// POST /api/visitor/track - Track a visitor
router.post('/track', trackVisitor);

// GET /api/visitor/stats - Get visitor statistics
router.get('/stats', getStats);

export default router;
