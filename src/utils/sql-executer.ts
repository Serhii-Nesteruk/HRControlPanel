import path from 'path';
import { promises as fs } from 'fs';
import DBModel from '../db-model';

async function checkFileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath, fs.constants.R_OK);
        return true;
    } catch {
        return false;
    }
}

/**
 * Reads SQL files and executes each query using the db.execute method.
 * @param fileName - the SQL file name (including extension)
 * @param db - an instance of DBModel used to execute queries
 * @param projectHomedir - the path to the project's root directory
 */

export default async function sqlExecuter(
    fileName: string,
    db: DBModel,
    projectHomedir: string
): Promise<void> {
    const filePath = path.join(projectHomedir, fileName);

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
