"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../../infrastructure/middleware/auth.middleware");
const user_controller_1 = require("../../../controllers/user.controller");
const router = (0, express_1.Router)();
const controller = new user_controller_1.UserController();
router.use(auth_middleware_1.authenticateToken);
// Rotas que requerem autenticação
router.get('/me', controller.getCurrentUser);
router.put('/me', controller.updateCurrentUser);
router.put('/me/password', controller.updatePassword);
// Rotas administrativas
router.get('/', (0, auth_middleware_1.requirePermission)('read:user'), controller.list);
router.post('/', (0, auth_middleware_1.requirePermission)('create:user'), controller.create);
router.get('/:id', (0, auth_middleware_1.requirePermission)('read:user'), controller.getById);
router.put('/:id', (0, auth_middleware_1.requirePermission)('update:user'), controller.update);
router.delete('/:id', (0, auth_middleware_1.requirePermission)('delete:user'), controller.delete);
exports.default = router;
