import { Router } from 'express';
import { 
  generateRandomPassword, 
  generateMemorablePassword,
  generatePassphrase 
} from '../controllers/generator.controller';

const router = Router();

router.post('/random', generateRandomPassword);
router.post('/memorable', generateMemorablePassword);
router.post('/passphrase', generatePassphrase);

export default router;
