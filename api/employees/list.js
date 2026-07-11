import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const employees = await sql`
      SELECT * FROM employees 
      WHERE active = true 
      ORDER BY department, name
    `;
    return res.status(200).json({ employees });
  } catch (e) {
    console.error('List employees error:', e);
    return res.status(500).json({ error: e.message });
  }
}