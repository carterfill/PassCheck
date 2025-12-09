import { Router } from 'express';
import { checkBreach, checkCommonPassword } from '../controllers/breach.controller';
import { validatePasswordPlain } from '../middleware/validation.middleware';

const router = Router();

// Breach endpoints don't need encryption - they only use hashing/comparison
router.post('/check', validatePasswordPlain, checkBreach);
router.post('/common', validatePasswordPlain, checkCommonPassword);

export default router;
