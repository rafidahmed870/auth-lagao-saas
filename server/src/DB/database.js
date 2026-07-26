const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');

const DB_URL = process.env.DATABASE_URL ?? null;
if (!DB_URL) {
  throw new Error('DATABASE_URL is not defined in the environment variables.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

module.exports = {
    db,
    pool
};
