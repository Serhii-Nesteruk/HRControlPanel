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
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
module.exports = class DBModel {
    constructor(db_name, port, host, user, pass) {
        this.pool = new Pool({
            user: user || 'postgres',
            host: host || 'localhost',
            database: db_name,
            password: pass,
            port: port || 5432
        });
        this.connect()
            .catch((err) => { console.log(`Failed to connect to db with error: ${err}`); });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                /** @type {import('pg').PoolClient} */
                const client = yield this.pool.connect();
                console.log('Connected to db');
                client.release();
            }
            catch (err) {
                console.err(err);
            }
        });
    }
    execute(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.pool.query(query);
            }
            catch (err) {
                console.error(`Error during executing the query: ${query} `, err.stack);
                throw new Error(`Error during executing the query: ${query} `);
            }
        });
    }
    delete(tableName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = 'DELETE FROM $1 WHERE id=$2';
                const values = [tableName, id];
                const result = yield this.pool.query(query, values);
                return result.rows[0] || null;
            }
            catch (err) {
                console.log(err);
                throw new Error(`Failed to delete item with id=${id} from table ${tableName}`);
            }
        });
    }
    findAllByTableName(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            const allowedTables = ['users'];
            if (!allowedTables.includes(tableName)) {
                throw new Error(`Invalid table name: ${tableName}`);
            }
            try {
                const query = `SELECT * FROM ${tableName}`;
                const result = yield this.pool.query(query);
                return result.rows;
            }
            catch (err) {
                console.log(err);
                throw new Error(`Error getting all records from the table: ${tableName}`);
            }
        });
    }
    findUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = 'SELECT username, email FROM users WHERE username=$1';
                const result = yield this.pool.query(query, [username]);
                return result.rows[0] || null;
            }
            catch (err) {
                throw new Error(`Failed to find user by username ${username}. Error message: ${err}`);
            }
        });
    }
    isUserExists(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
                if (!result || !result.rows) {
                    console.error('Invalid query result:', result);
                    throw new Error('Invalid query result in isUserExists');
                }
                return result.rows.length > 0;
            }
            catch (err) {
                console.error('Error checking if user exists:', err.stack);
                throw new Error('Error checking user existence');
            }
        });
    }
    registerUser(username, email, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (yield !this.isUserExists(username)) {
                    return null;
                }
                const salt = 10;
                const hashedPassword = yield bcrypt.hash(pass, salt);
                const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *';
                const values = [username, email, hashedPassword];
                const result = yield this.pool.query(query, values);
                return result.rows[0];
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    shouldToLoginUser(username, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = 'SELECT password FROM users WHERE username = $1';
                const value = [username];
                const result = yield this.pool.query(query, value);
                if (result.rows.length === 0) {
                    return false;
                }
                const hashedPassword = result.rows[0].password;
                return yield bcrypt.compare(pass, hashedPassword);
            }
            catch (err) {
            }
        });
    }
};
