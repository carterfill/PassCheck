import { Router } from 'express';
import { trackVisitor, getStats } from '../controllers/visitor.controller';
import { validateVisitorId } from '../middleware/validation.middleware';

const router = Router();

// POST /api/visitor/track - Track a visitor
router.post('/track', validateVisitorId, trackVisitor);

// GET /api/visitor/stats - Get visitor statistics
router.get('/stats', getStats);

export default router;
