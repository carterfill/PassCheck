import { Router } from 'express';
import { checkPasswordStrength, analyzePassword } from '../controllers/password.controller';

const router = Router();

router.post('/check', checkPasswordStrength);
router.post('/analyze', analyzePassword);

export default router;
