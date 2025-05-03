"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwt = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.jwt = jsonwebtoken_1.default;
const config_1 = require("./config/config");
const authenticateToken = (req, res, next) => {
    var _a, _b;
    let token = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token) !== null && _b !== void 0 ? _b : undefined;
    const authHeader = req.headers['authorization'];
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    if (!token) {
        res.status(401).json({ error: 'Missing token' });
        return;
    }
    jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET, {}, (err, decoded) => {
        if (err) {
            res.status(403).json({ error: 'Token is incorrect' });
            return;
        }
        req.user = decoded;
        next();
    });
};
exports.authenticateToken = authenticateToken;
