import {Request, Response, Router} from "express";
import {authenticateToken} from "../authToken";
import path from "path";
import DBModel from "../db-model";

export default function mainRouter(
    db: DBModel,
) : Router {
    const router = Router();

    router.get('/panel', authenticateToken, (_req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '..', 'public', 'panel.html'));
    });

    router.get('/profile', authenticateToken, (_req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '..', 'public','profile.html'));
    });

    router.get('/', async(req: Request, res: Response) => {
        if (req.cookies.token) {
            res.status(400).json({error: 'You already logged in.'})
            return void res.redirect('/profile');
        }
        res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
    })

    router.get('/api/profile', authenticateToken, async (req: Request, res: Response) => {
        const username = req.user!.username;
        const user = await db.findUserByUsername(username);
        res.status(200).json({ username: user?.username, email: user?.email });
    });

    return router;
}