// backend/src/routes/authRoutes.ts
import { Router } from 'express';
import { login, seedAdmin } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/seed-admin', seedAdmin); // rota temporária para gerar admin

export default router;
