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

    await sqlExecuter('schema.sql', db, { baseDir: path.resolve(__dirname, '..') });

    const app: Application = express();

    middlewareConfig(app);

    const panelRouter = (await import('./routes/panel')).default(db, authenticateToken);
    app.use('/api/panel', panelRouter);

    const authRouter = (await import('./routes/auth')).default(db, jwt);
    app.use('/api/auth', authRouter);

    app.get('/panel', authenticateToken, (_req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, 'public', 'panel.html'));
    });

    app.get('/profile', authenticateToken, (_req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, 'public', 'profile.html'));
    });
    app.get('/', async(req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    })

    app.get('/api/profile', authenticateToken, async (req: Request, res: Response) => {
        const username = req.user!.username;
        const user = await db.findUserByUsername(username);
        res.status(200).json({ username: user?.username, email: user?.email });
    });


    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

main().catch(err => {
    console.error('Server failed to start:', err);
    process.exit(1);
});
