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
const path = require('path');
const express = require(`express`);
const router = express.Router();
module.exports = (db, authenticateToken) => {
    router.get('/getAll', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { tableName } = req.query;
        const rows = yield db.findAllByTableName(tableName);
        res.status(200).json(JSON.stringify(rows));
    }));
    router.get('/get', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { tableName, id } = req.query;
        /* TODO: implement me */
    }));
    router.post('/delete', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { tableName, id } = req.query;
        /* TODO: implement me */
    }));
    router.post('/add', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { tableName, record } = req.query;
        /* TODO: implement me */
    }));
    return router;
};
