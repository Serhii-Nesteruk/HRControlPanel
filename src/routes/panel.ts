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
        '/search',
        authenticateToken,
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const query = req.query.query as string;

                if (!query) {
                    res.status(400).json({ error: 'search query can`t be empty' });
                    return;
                }

                const result = await db.searchAllTables(query);

                if (!result) {
                    res.status(404).json({error: 'No results found'});
                    return;
                }

                res.status(200).json(result);
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

                const row = await db.delete(tableName, id);
                res.status(200).json(row);
            } catch (err: any) {
                next(err);
            }
        }
    );

    router.delete(
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

    router.patch(
        '/edit',
        authenticateToken,
        async(req: Request, res: Response): Promise<void> => {
            try {
                const table = req.query.tableName as string;
                const id = Number(req.query.id);
                const editedColumnName = req.query.editedColumn as string;
                const editedColumnValue = req.query.newValue as string;

                const result = await db.edit(table, id, editedColumnName, editedColumnValue);
                if (!result) {
                    res.status(401).json({ error: 'Failed to edit record' });
                }

                res.status(200).json(result);
            } catch (err) {

                console.error('Failed to edit record', err);
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
                const record = req.body as Record<string, any>;

                const columns = Object.keys(record);
                if (columns.length === 0) {
                    res.status(400).json({ error: 'Empty record payload' });
                    return;
                }

                // Use parameterized queries instead of string concatenation
                const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
                const values = columns.map(col => {
                    const val = record[col];
                    if (val === null || val === undefined || val === '') {
                        return null;
                    }
                    return val;
                });

                const sql = `
                INSERT INTO ${tableName} (${columns.join(', ')})
                VALUES (${placeholders})
                RETURNING *
            `;

                console.log('SQL:', sql);
                console.log('Values:', values);
                console.log('Record:', record);

                const result = await db.executeWithParams<any>(sql, values);
                res.status(201).json(result.rows[0]);
            } catch (err: any) {
                console.error('Error in /add route:', err);
                next(err);
            }
        }
    );
    /*
    router.post(
        '/add',
        authenticateToken,
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const tableName = req.query.tableName as string;
                const record = req.body as Record<string, any>;

                const columns = Object.keys(record);
                if (columns.length === 0) {
                    res.status(400).json({ error: 'Empty record payload' });
                    return;
                }

                const valuesSql = columns.map(col => {
                    const val = record[col];
                    if (val === null || val === undefined) {
                        return 'NULL';
                    }
                    switch (typeof val) {
                        case 'number':
                            return String(val);
                        case 'boolean':
                            return val ? 'TRUE' : 'FALSE';
                        case 'string':

                            const escaped = val.replace(/'/g, "''");
                            return `'${escaped}'`;
                        default:
                            const json = JSON.stringify(val).replace(/'/g, "''");
                            return `'${json}'`;
                    }
                }).join(', ');

                const sql = `
                    INSERT INTO ${tableName} (${columns.join(', ')})
                    VALUES (${valuesSql})
                        RETURNING *
                `;

                const result = await db.execute<any>(sql);
                res.status(201).json(result.rows[0]);
            } catch (err: any) {
                next(err);
            }
        }
    );*/


    return router;
}
