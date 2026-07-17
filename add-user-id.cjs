const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/DATABASE_URL="?([^"\n]+)"?/);
const url = match[1].trim();
const sql = neon(url);

async function migrate() {
  await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_id TEXT`;
  console.log('Column added!');
}

migrate().catch(console.error);