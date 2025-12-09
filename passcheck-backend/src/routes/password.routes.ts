import { Router } from 'express';
import { checkPasswordStrength, analyzePassword } from '../controllers/password.controller';
import { validatePassword } from '../middleware/validation.middleware';

const router = Router();

router.post('/check', validatePassword, checkPasswordStrength);
router.post('/analyze', validatePassword, analyzePassword);

export default router;
