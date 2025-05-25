import {PORT, DB_USER, DB_PASS} from "./config/config";

import express, { Application, Request, Response } from 'express';
import path from 'path';

import middlewareConfig from './midleware-config';
import { authenticateToken, jwt } from './authToken';
import DBModel from './db-model';
import sqlExecuter from "./utils/sql-executer";

declare global {
    namespace Express {
        interface Request {
            user?: {
                username: string;
                [key: string]: any;
            };
        }
    }
}

async function main(): Promise<void> {
    const db = new DBModel('panel', 5432, 'localhost', DB_USER, DB_PASS);

    const baseDirObj = { baseDir: path.resolve(__dirname, '..') };
    await sqlExecuter('schema.sql', db, baseDirObj);
    await sqlExecuter('mock-data.sql', db, baseDirObj);

    const app: Application = express();

    middlewareConfig(app);

    const panelRouter = (await import('./routes/panel')).default(db, authenticateToken);
    app.use('/api/panel', panelRouter);

    const authRouter = (await import('./routes/auth')).default(db, jwt);
    app.use('/api/auth', authRouter);

    const mainRouter = (await import('./routes/main')).default(db);
    app.use(mainRouter);

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

main().catch(err => {
    console.error('Server failed to start:', err);
    process.exit(1);
});
