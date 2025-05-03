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
exports.default = sqlExecuter;
// src/utils/sql-executer.ts
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
/**
 * Check if a file exists and is readable
 */
function checkFileExists(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_1.promises.access(filePath, fs_1.promises.constants.R_OK);
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
/**
 * Reads a SQL file and executes each query using the db.execute method.
 * @param filePathOrName - the SQL file path or name (if name, resolved against baseDir)
 * @param db - an instance of DBModel used to execute queries
 * @param options - optional settings (e.g. custom baseDir)
 */
function sqlExecuter(filePathOrName_1, db_1) {
    return __awaiter(this, arguments, void 0, function* (filePathOrName, db, options = {}) {
        var _a;
        const baseDir = (_a = options.baseDir) !== null && _a !== void 0 ? _a : process.cwd();
        const filePath = path_1.default.isAbsolute(filePathOrName)
            ? filePathOrName
            : path_1.default.resolve(baseDir, filePathOrName);
        if (!(yield checkFileExists(filePath))) {
            throw new Error(`Failed to execute sql file: ${filePath}`);
        }
        const fileContent = yield fs_1.promises.readFile(filePath, 'utf8');
        const queries = fileContent
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);
        for (const query of queries) {
            yield db.execute(query);
        }
    });
}
