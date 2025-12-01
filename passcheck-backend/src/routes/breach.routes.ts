import { Router } from 'express';
import { checkBreach, checkCommonPassword } from '../controllers/breach.controller';

const router = Router();

router.post('/check', checkBreach);
router.post('/common', checkCommonPassword);

export default router;
