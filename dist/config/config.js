"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_PASS = exports.DB_USER = exports.PORT = exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.PORT = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : '5000', 10);
exports.DB_USER = process.env.DB_USERNAME;
exports.DB_PASS = process.env.DB_PASS;
