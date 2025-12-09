import { Router } from 'express';
import { checkPasswordStrength, analyzePassword } from '../controllers/password.controller';
import { validatePasswordPlain } from '../middleware/validation.middleware';

const router = Router();

// Password analysis endpoints don't need encryption - only analyze locally
router.post('/check', validatePasswordPlain, checkPasswordStrength);
router.post('/analyze', validatePasswordPlain, analyzePassword);

export default router;
