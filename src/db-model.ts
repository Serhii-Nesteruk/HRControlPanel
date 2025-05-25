// src/db-model.ts
import { Pool, QueryResult, QueryResultRow } from 'pg';
import bcrypt from 'bcrypt';
import { User } from './config/types';

export default class DBModel {
    private pool: Pool;
    constructor(
        dbName: string,
        port: number,
        host: string,
        user: string,
        pass: string
    ) {
        this.pool = new Pool({
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

    private async connect(): Promise<void> {
        try {
            const client = await this.pool.connect();
            console.log('Connected to db');
            client.release();
        } catch (err: any) {
            console.error('DB connection error:', err);
        }
    }

    public async execute<T extends QueryResultRow = any>(
        query: string
    ): Promise<QueryResult<T>> {
        try {
            return await this.pool.query<T>(query);
        } catch (err: any) {
            console.error(`Error executing query: ${query}`, err.stack);
            throw new Error(`Error executing query: ${query}`);
        }
    }

    public async executeWithParams<T extends QueryResultRow = any>(
        query: string,
        params?: any[]
    ): Promise<QueryResult<T>> {
        try {
            if (params) {
                return await this.pool.query<T>(query, params);
            } else {
                return await this.pool.query<T>(query);
            }
        } catch (err: any) {
            console.error(`Error executing query: ${query}`, err.stack);
            console.error('Query params:', params);
            throw new Error(`Error executing query: ${query} - ${err.message}`);
        }
    }

    public async delete<T extends QueryResultRow = any>(
        tableName: string,
        id: number
    ): Promise<T | null> {
        try {
            const query = `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`;
            const result: QueryResult<T> = await this.pool.query<T>(query, [id]);
            return result.rows[0] ?? null;
        } catch (err: any) {
            console.error(`Failed to delete id=${id} from ${tableName}:`, err);
            throw new Error(`Failed to delete id=${id} from table ${tableName}`);
        }
    }

    public async searchAllTables(
        search: string
    ): Promise<
        { table: string; column: string; row: Record<string, any> }[]
    > {
        const results: { table: string; column: string; row: Record<string, any> }[] = [];

        const tables = await this.getTableNames();

        for (const table of tables) {
            const columns = await this.getColumns(table);
            const textColumns = columns
                .filter((col: any) =>
                    ['character varying', 'text', 'varchar', 'char'].includes(col.data_type)
                )
                .map((col: any) => col.column_name);

            for (const col of textColumns) {
                const query = `
                SELECT * FROM "${table}"
                WHERE "${col}" ILIKE $1
            `;
                const matches = await this.pool.query(query, [`%${search}%`]);
                for (const row of matches.rows) {
                    results.push({
                        table,
                        column: col,
                        row,
                    });
                }
            }
        }

        return results;
    }


    public async getColumns<T extends QueryResultRow>(tableName: string): Promise<T[]> {
        try {
            const query = `
             SELECT column_name, data_type
             FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name   = $1
             ORDER BY ordinal_position
           `;
            const result: QueryResult<T> = await this.pool.query<T>(query, [tableName]);
            return result.rows;
        } catch(err) {
            console.error(`Failed to get columns of table ${tableName}: `, err);
            throw new Error(`Failed to get columns of table ${tableName}`);
        }
    }

    public async edit(tableName: string, id: number,    column: string, value: string) {
        try {
            const query = `
              UPDATE "${tableName}"
              SET "${column}" = $1
              WHERE id = $2
              RETURNING *;
            `;
            const params = [value, id];
            const result = await this.pool.query(query, params);
            return result.rows[0];
        } catch (err) {
            console.error(err);
            throw new Error(`Failed to edit column ${column} from table: ${tableName}`);
        }
    }

    public async findAllByTableName<T extends QueryResultRow = any>(
        tableName: string
    ): Promise<T[]> {
        try {
            const query = `SELECT * FROM ${tableName}`;
            const result: QueryResult<T> = await this.pool.query<T>(query);
            return result.rows;
        } catch (err: any) {
            console.error(`Error fetching all from ${tableName}:`, err);
            throw new Error(`Error getting all records from table ${tableName}`);
        }
    }

    public async findUserByUsername(
        username: string
    ): Promise<Pick<User, 'username' | 'email'> | null> {
        try {
            const query = 'SELECT username, email FROM users WHERE username = $1';
            const result: QueryResult<Pick<User, 'username' | 'email'>> =
                await this.pool.query<Pick<User, 'username' | 'email'>>(query, [username]);
            return result.rows[0] ?? null;
        } catch (err: any) {
            console.error(`Error finding user ${username}:`, err);
            throw new Error(
                `Failed to find user by username ${username}: ${err.message}`
            );
        }
    }

    public async isUserExists(
        username: string
    ): Promise<boolean> {
        try {
            const result: QueryResult<{}> =
                await this.pool.query('SELECT 1 FROM users WHERE username = $1', [
                    username,
                ]);
            return result.rows.length > 0;
        } catch (err: any) {
            console.error('Error checking if user exists:', err);
            return false;
        }
    }

    public async registerUser(
        username: string,
        email: string,
        pass: string
    ): Promise<User | null> {
        try {
            if (await this.isUserExists(username)) {
                return null;
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(pass, saltRounds);

            const query =
                'INSERT INTO users (username, email, pass) VALUES ($1, $2, $3) RETURNING *';
            const result: QueryResult<User> =
                await this.pool.query<User>(query, [username, email, hashedPassword]);
            return result.rows[0];
        } catch (err: any) {
            console.error('Error registering user:', err);
            return null;
        }
    }

    public async getTableNames(): Promise<string[]> {
        const query = `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_type   = 'BASE TABLE'
        `;
        const result = await this.pool.query<{ table_name: string }>(query);
        return result.rows.map(r => r.table_name);
    }

    public async shouldToLoginUser(
        username: string,
        pass: string
    ): Promise<boolean> {
        try {
            const query = 'SELECT pass FROM users WHERE username = $1';
            const result: QueryResult<{ pass: string }> =
                await this.pool.query<{ pass: string }>(query, [username]);

            if (result.rows.length === 0) {
                return false;
            }

            const hashedPassword = result.rows[0].pass;
            return bcrypt.compare(pass, hashedPassword);
        } catch (err: any) {
            console.error('Error during login check:', err);
            return false;
        }
    }
}
