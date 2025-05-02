"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = middlewareConfig;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
function middlewareConfig(app) {
    const apiLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 хв
        max: 100,
        message: 'Too many requests',
    });
    app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "script-src": ["'self'", "https://cdn.tailwindcss.com"],
                "script-src-attr": ["'unsafe-inline'"],
                "style-src": ["'self'", "'unsafe-inline'"],
            },
        },
    }));
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin || origin.startsWith('http://localhost')) {
                callback(null, true);
            }
            else {
                callback(new Error('The origin is not allowed'));
            }
        },
        credentials: true,
    }));
    app.use('/api/', apiLimiter);
}
