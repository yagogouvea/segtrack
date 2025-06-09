"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonUtils = void 0;
exports.jsonUtils = {
    parse: (value) => {
        if (value === null)
            return null;
        if (typeof value === 'string')
            return JSON.parse(value);
        return value;
    },
    stringify: (value) => {
        if (value === null)
            return null;
        if (typeof value === 'string')
            return value;
        return JSON.stringify(value);
    }
};
