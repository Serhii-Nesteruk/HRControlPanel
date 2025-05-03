// src/utils/sql-executer.ts
import path from 'path';
import { promises as fs } from 'fs';
import DBModel from '../db-model';

/**
 * Check if a file exists and is readable
 */
async function checkFileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath, fs.constants.R_OK);
        return true;
    } catch {
        return false;
    }
}

interface SqlExecutorOptions {
    /**
     * Base directory to resolve file paths from. Defaults to process.cwd().
     */
    baseDir?: string;
}

/**
 * Reads a SQL file and executes each query using the db.execute method.
 * @param filePathOrName - the SQL file path or name (if name, resolved against baseDir)
 * @param db - an instance of DBModel used to execute queries
 * @param options - optional settings (e.g. custom baseDir)
 */
export default async function sqlExecuter(
    filePathOrName: string,
    db: DBModel,
    options: SqlExecutorOptions = {}
): Promise<void> {
    const baseDir = options.baseDir ?? process.cwd();
    const filePath = path.isAbsolute(filePathOrName)
        ? filePathOrName
        : path.resolve(baseDir, filePathOrName);

    if (!(await checkFileExists(filePath))) {
        throw new Error(`Failed to execute sql file: ${filePath}`);
    }

    const fileContent = await fs.readFile(filePath, 'utf8');
    const queries = fileContent
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0);

    for (const query of queries) {
        await db.execute(query);
    }
}
