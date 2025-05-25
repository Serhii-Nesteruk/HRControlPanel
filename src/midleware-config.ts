// src/middleware-config.ts
import { Application } from 'express';
import cors from 'cors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

export default function middlewareConfig(app: Application): void {
    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 хв
        max: 100,
        message: 'Too many requests',
    });

    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cookieParser());

    app.use(
        helmet({
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    "script-src": [
                        "'self'",
                        "https://cdn.tailwindcss.com",
                        "https://fonts.googleapis.com/",
                        "https://cdnjs.cloudflare.com/",
                        "https://cdn.tailwindcss.com"
                    ],
                    "script-src-attr": ["'unsafe-inline'"],
                    "style-src": ["'self'", "'unsafe-inline'"],
                    "style-src-elem": [
                        "'self'",
                        "'unsafe-inline'",
                        "https://fonts.googleapis.com",
                        "https://cdnjs.cloudflare.com"
                    ],
                    "script-src-elem": [
                        "'self'",
                        "'unsafe-inline'",
                        "https://cdn.tailwindcss.com",
                        "https://cdnjs.cloudflare.com"
                    ],
                },
            },
        })
    );
    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin || origin.startsWith('http://localhost')) {
                    callback(null, true);
                } else {
                    callback(new Error('The origin is not allowed'));
                }
            },
            credentials: true,
        })
    );

    app.use('/api/', apiLimiter);
}
