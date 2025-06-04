import express from 'express';
import { requirePermission, AuthRequest, createAuthenticatedHandler } from '../middleware/authMiddleware';
import * as userController from '../controllers/userController';

const router = express.Router();

// Get current user
router.get('/me', 
  createAuthenticatedHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    res.json(req.user);
  })
);

// Get all users
router.get('/', 
  requirePermission('users:read'),
  userController.getUsers
);

// Get user by ID
router.get('/:id',
  requirePermission('users:read'),
  userController.getUser
);

// Create user
router.post('/',
  requirePermission('users:create'),
  userController.createUser
);

// Update user
router.put('/:id',
  requirePermission('users:update'),
  userController.updateUser
);

// Delete user
router.delete('/:id',
  requirePermission('users:delete'),
  userController.deleteUser
);

// Update user password
router.put('/:id/password',
  requirePermission('users:update'),
  userController.updateUserPassword
);

export default router;
