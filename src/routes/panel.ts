// src/routes/panel.ts
import { Router, Request, Response, NextFunction } from 'express';
import { QueryResult } from 'pg';
import DBModel from '../db-model';

export default function panelRouter(
    db: DBModel,
    authenticateToken: (req: Request, res: Response, next: NextFunction) => void
): Router {
    const router = Router();

    router.get(
        '/getAll',
        authenticateToken,
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const tableName = req.query.tableName as string;
                const rows = await db.findAllByTableName<any>(tableName);
                res.status(200).json(rows);
            } catch (err: any) {
                next(err);
            }
        }
    );

    router.get(
        '/get',
        authenticateToken,
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const tableName = req.query.tableName as string;
                const id = Number(req.query.id);
                // TODO: implement fetching by id
                const row = await db.delete(tableName, id); // placeholder
                res.status(200).json(row);
            } catch (err: any) {
                next(err);
            }
        }
    );

    router.post(
        '/delete',
        authenticateToken,
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const tableName = req.query.tableName as string;
                const id = Number(req.query.id);
                const deleted = await db.delete(tableName, id);
                res.status(200).json(deleted);
            } catch (err: any) {
                next(err);
            }
        }
    );

    router.get(
        '/tables',
        authenticateToken,
        async (_req, res) => {
            try {
                const tables = await db.getTableNames();
                res.json(tables);
            } catch (err) {
                console.error('Error fetching table names:', err);
                res.status(500).json({ error: 'Cannot fetch table list' });
            }
        }
    );

    router.get(
        '/columns',
        authenticateToken,
        async(req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const tableName = req.query.tableName as string;
                if (!tableName) {
                    res.status(400).json({ error: 'Missing tableName parameter' });
                    return;
                }
                const columns = await db.getColumns(tableName);
                res.status(200).json(columns);
            } catch(err: any) {
                console.log(err);
            }
        }
    );

    router.post(
        '/add',
        authenticateToken,
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const tableName = req.query.tableName as string;
                const record = req.body;
                // TODO: implement insertion logic
                const result = await db.execute(
                    `INSERT INTO ${tableName} ... RETURNING *`
                );
                res.status(201).json(result.rows[0]);
            } catch (err: any) {
                next(err);
            }
        }
    );

    return router;
}
