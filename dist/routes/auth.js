"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRouter;
// src/routes/auth.ts
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
function authRouter(db, jwtLib = jsonwebtoken_1.default) {
    const router = (0, express_1.Router)();
    router.post('/login', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required' });
            return;
        }
        try {
            const success = yield db.shouldToLoginUser(username, password);
            if (!success) {
                res.status(401).json({ error: 'Invalid username or password' });
                return;
            }
            const token = jwtLib.sign({ username }, config_1.JWT_SECRET, {
                expiresIn: '1h',
            });
            res.cookie('token', token, { httpOnly: true, path: '/' });
            res.status(200).json({ message: 'Login successful' });
            return;
        }
        catch (err) {
            next(err);
            return;
        }
    }));
    router.post('/register', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        try {
            const user = yield db.registerUser(username, email, password);
            if (!user) {
                res.status(400).json({ error: 'User already exists' });
                return;
            }
            const token = jwtLib.sign({ username }, config_1.JWT_SECRET, {
                expiresIn: '1h',
            });
            res.cookie('token', token, { httpOnly: true, path: '/' });
            res.status(201).json({ message: 'Registration successful' });
            return;
        }
        catch (err) {
            next(err);
            return;
        }
    }));
    router.get('/logout', (req, res) => {
        res.clearCookie('token', { path: '/' });
        res.redirect('/');
    });
    return router;
}
