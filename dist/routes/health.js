"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    return res.status(200).json({ message: 'API SEGTRACK funcionando corretamente!' });
});
exports.default = router;
