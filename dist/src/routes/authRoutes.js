"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/authRoutes.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post('/login', authController_1.login);
router.post('/seed-admin', authController_1.seedAdmin); // rota temporária para gerar admin
exports.default = router;
//# sourceMappingURL=authRoutes.js.map