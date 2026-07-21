const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/DATABASE_URL="?([^"\n]+)"?/);
const url = match[1].trim();
const sql = neon(url);

async function setup() {
  await sql`CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY,
    company TEXT,
    industry TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
  console.log('Profiles table created!');
}

setup().catch(console.error);