import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { readFile } from 'fs/promises';
async function setupDb() {
    const db = await open({
        filename: 'pong.db',
        driver: sqlite3.Database
    });
    const sql = await readFile('./bdd.sql', 'utf-8');
    await db.exec(sql);
    return db;
}
export default setupDb;
