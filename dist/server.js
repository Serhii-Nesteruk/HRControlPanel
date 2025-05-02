"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const midleware_config_1 = __importDefault(require("./midleware-config"));
const authToken_1 = require("./authToken");
const db_model_1 = __importDefault(require("./db-model"));
const sql_executer_1 = __importDefault(require("./utils/sql-executer"));
const PORT = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : '5000', 10);
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASS = process.env.DB_PASS;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = new db_model_1.default('panel', 5432, 'localhost', DB_USERNAME, DB_PASS);
        yield (0, sql_executer_1.default)('schema.sql', db, __dirname);
        const app = (0, express_1.default)();
        (0, midleware_config_1.default)(app);
        // Routers
        const panelRouter = (yield Promise.resolve().then(() => __importStar(require('./routes/panel')))).default(db, authToken_1.authenticateToken);
        app.use('/api/panel', panelRouter);
        const authRouter = (yield Promise.resolve().then(() => __importStar(require('./routes/auth')))).default(db, authToken_1.jwt);
        app.use('/api/auth', authRouter);
        // Frontend routes
        app.get('/panel', authToken_1.authenticateToken, (_req, res) => {
            res.sendFile(path_1.default.join(__dirname, '..', 'public', 'panel.html'));
        });
        app.get('/profile', authToken_1.authenticateToken, (_req, res) => {
            res.sendFile(path_1.default.join(__dirname, '..', 'public', 'profile.html'));
        });
        app.get('/api/profile', authToken_1.authenticateToken, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const username = req.user.username;
            const user = yield db.findUserByUsername(username);
            res.status(200).json({ username: user.username, email: user.email });
        }));
        app.get('/', (_req, res) => {
            res.sendFile(path_1.default.join(__dirname, '..', 'public', 'login.html'));
        });
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    });
}
main().catch(err => {
    console.error('Server failed to start:', err);
    process.exit(1);
});
