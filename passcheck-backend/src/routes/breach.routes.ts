import { Router } from 'express';
import { checkBreach, checkCommonPassword } from '../controllers/breach.controller';
import { validatePassword } from '../middleware/validation.middleware';

const router = Router();

router.post('/check', validatePassword, checkBreach);
router.post('/common', validatePassword, checkCommonPassword);

export default router;
