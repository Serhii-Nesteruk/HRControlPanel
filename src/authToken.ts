import { Request, Response, NextFunction } from 'express';
import jwt, {JwtPayload, VerifyErrors} from 'jsonwebtoken';
import { JWT_SECRET } from './config/config';

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let token = (req.cookies?.token as string) ?? undefined;

    const authHeader = req.headers['authorization'];
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        res.status(401).json({ error: 'Missing token' });
        return;
    }

    jwt.verify(
        token,
        JWT_SECRET,
        {},
        (err: VerifyErrors | null, decoded) => {
            if (err) {
                res.status(403).json({ error: 'Token is incorrect' });
                return;
            }
            req.user = (decoded as JwtPayload & {username: string});
            next();
        }
    );
};

export { jwt };
