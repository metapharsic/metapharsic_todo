const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'metapharsic_todo_db',
  password: process.env.DB_PASSWORD || 'admin',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log("Connecting to database for schema migration...");

    // 1. Alter created_at safely
    console.log("Upgrading 'created_at' in 'issues' table to TIMESTAMP WITH TIME ZONE...");
    await client.query(`
      ALTER TABLE issues 
      ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE 
      USING created_at::timestamp with time zone;
    `);
    await client.query(`
      ALTER TABLE issues 
      ALTER COLUMN created_at SET DEFAULT NOW();
    `);

    // 2. Add updated_at column
    console.log("Adding 'updated_at' TIMESTAMP WITH TIME ZONE column to 'issues' table...");
    await client.query(`
      ALTER TABLE issues 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `);

    // 3. Initialize updated_at for existing rows
    console.log("Initializing 'updated_at' values for existing tasks...");
    await client.query(`
      UPDATE issues 
      SET updated_at = created_at 
      WHERE updated_at IS NULL OR updated_at = created_at;
    `);

    console.log(" Database migration completed successfully!");
  } catch (err) {
    console.error(" Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
