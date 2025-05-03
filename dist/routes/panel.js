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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = panelRouter;
// src/routes/panel.ts
const express_1 = require("express");
function panelRouter(db, authenticateToken) {
    const router = (0, express_1.Router)();
    router.get('/getAll', authenticateToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const tableName = req.query.tableName;
            const rows = yield db.findAllByTableName(tableName);
            res.status(200).json(rows);
        }
        catch (err) {
            next(err);
        }
    }));
    router.get('/get', authenticateToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const tableName = req.query.tableName;
            const id = Number(req.query.id);
            // TODO: implement fetching by id
            const row = yield db.delete(tableName, id); // placeholder
            res.status(200).json(row);
        }
        catch (err) {
            next(err);
        }
    }));
    router.post('/delete', authenticateToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const tableName = req.query.tableName;
            const id = Number(req.query.id);
            const deleted = yield db.delete(tableName, id);
            res.status(200).json(deleted);
        }
        catch (err) {
            next(err);
        }
    }));
    router.get('/tables', authenticateToken, (_req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const tables = yield db.getTableNames();
            res.json(tables);
        }
        catch (err) {
            console.error('Error fetching table names:', err);
            res.status(500).json({ error: 'Cannot fetch table list' });
        }
    }));
    router.get('/columns', authenticateToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const tableName = req.query.tableName;
            if (!tableName) {
                res.status(400).json({ error: 'Missing tableName parameter' });
                return;
            }
            const columns = yield db.getColumns(tableName);
            res.status(200).json(columns);
        }
        catch (err) {
            console.log(err);
        }
    }));
    router.post('/add', authenticateToken, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const tableName = req.query.tableName;
            const record = req.body;
            // TODO: implement insertion logic
            const result = yield db.execute(`INSERT INTO ${tableName} ... RETURNING *`);
            res.status(201).json(result.rows[0]);
        }
        catch (err) {
            next(err);
        }
    }));
    return router;
}
