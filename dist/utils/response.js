"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
exports.sendResponse = {
    ok: (res, data) => {
        res.json(data);
    },
    created: (res, data) => {
        res.status(201).json(data);
    },
    noContent: (res) => {
        res.status(204).send();
    },
    badRequest: (res, message = 'Bad Request') => {
        res.status(400).json({ error: message });
    },
    unauthorized: (res, message = 'Unauthorized') => {
        res.status(401).json({ error: message });
    },
    forbidden: (res, message = 'Forbidden') => {
        res.status(403).json({ error: message });
    },
    notFound: (res, message = 'Not Found') => {
        res.status(404).json({ error: message });
    },
    error: (res, error) => {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
