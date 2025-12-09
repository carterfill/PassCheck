import { Router } from 'express';
import { 
  generateRandomPassword, 
  generateMemorablePassword,
  generatePassphrase 
} from '../controllers/generator.controller';
import { 
  validateRandomPassword, 
  validateMemorablePassword, 
  validatePassphrase 
} from '../middleware/validation.middleware';

const router = Router();

router.post('/random', validateRandomPassword, generateRandomPassword);
router.post('/memorable', validateMemorablePassword, generateMemorablePassword);
router.post('/passphrase', validatePassphrase, generatePassphrase);

export default router;
