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
// src/db-model.ts
const pg_1 = require("pg");
const bcrypt_1 = __importDefault(require("bcrypt"));
class DBModel {
    constructor(dbName, port, host, user, pass) {
        this.pool = new pg_1.Pool({
            user: user || 'postgres',
            host: host || 'localhost',
            database: dbName,
            password: String(pass),
            port: port || 5432,
        });
        this.connect().catch((err) => {
            console.error(`Failed to connect to db: ${err}`);
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield this.pool.connect();
                console.log('Connected to db');
                client.release();
            }
            catch (err) {
                console.error('DB connection error:', err);
            }
        });
    }
    execute(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.pool.query(query);
            }
            catch (err) {
                console.error(`Error executing query: ${query}`, err.stack);
                throw new Error(`Error executing query: ${query}`);
            }
        });
    }
    delete(tableName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const query = `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`;
                const result = yield this.pool.query(query, [id]);
                return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
            }
            catch (err) {
                console.error(`Failed to delete id=${id} from ${tableName}:`, err);
                throw new Error(`Failed to delete id=${id} from table ${tableName}`);
            }
        });
    }
    getColumns(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = `
             SELECT column_name, data_type
             FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name   = $1
             ORDER BY ordinal_position
           `;
                const result = yield this.pool.query(query, [tableName]);
                return result.rows;
            }
            catch (err) {
                console.error(`Failed to get columns of table ${tableName}: `, err);
                throw new Error(`Failed to get columns of table ${tableName}`);
            }
        });
    }
    findAllByTableName(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = `SELECT * FROM ${tableName}`;
                const result = yield this.pool.query(query);
                return result.rows;
            }
            catch (err) {
                console.error(`Error fetching all from ${tableName}:`, err);
                throw new Error(`Error getting all records from table ${tableName}`);
            }
        });
    }
    findUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const query = 'SELECT username, email FROM users WHERE username = $1';
                const result = yield this.pool.query(query, [username]);
                return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
            }
            catch (err) {
                console.error(`Error finding user ${username}:`, err);
                throw new Error(`Failed to find user by username ${username}: ${err.message}`);
            }
        });
    }
    isUserExists(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.pool.query('SELECT 1 FROM users WHERE username = $1', [
                    username,
                ]);
                return result.rows.length > 0;
            }
            catch (err) {
                console.error('Error checking if user exists:', err);
                return false;
            }
        });
    }
    registerUser(username, email, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (yield this.isUserExists(username)) {
                    return null;
                }
                const saltRounds = 10;
                const hashedPassword = yield bcrypt_1.default.hash(pass, saltRounds);
                const query = 'INSERT INTO users (username, email, pass) VALUES ($1, $2, $3) RETURNING *';
                const result = yield this.pool.query(query, [username, email, hashedPassword]);
                return result.rows[0];
            }
            catch (err) {
                console.error('Error registering user:', err);
                return null;
            }
        });
    }
    getTableNames() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_type   = 'BASE TABLE'
        `;
            const result = yield this.pool.query(query);
            return result.rows.map(r => r.table_name);
        });
    }
    shouldToLoginUser(username, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = 'SELECT pass FROM users WHERE username = $1';
                const result = yield this.pool.query(query, [username]);
                if (result.rows.length === 0) {
                    return false;
                }
                const hashedPassword = result.rows[0].pass;
                return bcrypt_1.default.compare(pass, hashedPassword);
            }
            catch (err) {
                console.error('Error during login check:', err);
                return false;
            }
        });
    }
}
exports.default = DBModel;
