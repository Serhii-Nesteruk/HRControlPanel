// src/routes/auth.ts
import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import DBModel from '../db-model';
import { JWT_SECRET } from '../config/config';

export default function authRouter(
    db: DBModel,
    jwtLib: typeof jwt = jwt
): Router {
    const router = Router();

    router.post(
        '/login',
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const { username, password } = req.body as {
                username?: string;
                password?: string;
            };
            if (!username || !password) {
                res.status(400).json({ error: 'Username and password are required' });
                return;
            }

            try {
                const success = await db.shouldToLoginUser(username, password);
                if (!success) {
                    res.status(401).json({ error: 'Invalid username or password' });
                    return;
                }

                const token = jwtLib.sign({ username }, JWT_SECRET, {
                    expiresIn: '1h',
                });
                res.cookie('token', token, { httpOnly: true, path: '/' });
                res.status(200).json({ message: 'Login successful' });
                return;
            } catch (err: any) {
                next(err);
                return;
            }
        }
    );

    router.post(
        '/register',
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const { username, email, password } = req.body as {
                username?: string;
                email?: string;
                password?: string;
            };
            if (!username || !email || !password) {
                res.status(400).json({ error: 'All fields are required' });
                return;
            }

            try {
                const user = await db.registerUser(username, email, password);
                if (!user) {
                    res.status(400).json({ error: 'User already exists' });
                    return;
                }

                const token = jwtLib.sign({ username }, JWT_SECRET, {
                    expiresIn: '1h',
                });
                res.cookie('token', token, { httpOnly: true, path: '/' });
                res.status(201).json({ message: 'Registration successful' });
                return;
            } catch (err: any) {
                next(err);
                return;
            }
        }
    );

    router.post('/logout', (req: Request, res: Response): void => {
        res.clearCookie('token', { path: '/' });
        res.redirect('/');
    });

    return router;
}
