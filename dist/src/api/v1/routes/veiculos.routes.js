"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../../infrastructure/middleware/auth.middleware");
const veiculo_controller_1 = require("../../../controllers/veiculo.controller");
const router = (0, express_1.Router)();
const controller = new veiculo_controller_1.VeiculoController();
router.use(auth_middleware_1.authenticateToken);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
exports.default = router;
//# sourceMappingURL=veiculos.routes.js.map