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
const path = require("path");
const express = require("express");
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'test';
module.exports = (db, jwt) => {
    router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        try {
            const success = yield db.shouldToLoginUser(username, password);
            if (success) {
                const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
                res.cookie('token', token, { httpOnly: true, path: '/' });
                return res.status(200).json({ message: 'Login successful' });
            }
            else {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
        }
        catch (err) {
            console.error('Login error:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }));
    router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        try {
            const user = yield db.registerUser(username, email, password);
            if (user) {
                const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
                res.cookie('token', token, { httpOnly: true, path: '/' });
                return res.status(201).json({ message: 'Registration successful' });
            }
            else {
                return res.status(400).json({ error: 'User already exists' });
            }
        }
        catch (err) {
            console.error('Registration error:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }));
    router.get('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.clearCookie('token', { path: '/' });
        return res.redirect('/');
    }));
    return router;
};
