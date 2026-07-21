import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { company, industry } = body;

    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`
      INSERT INTO user_profiles (user_id, company, industry, updated_at)
      VALUES (${userId}, ${company}, ${industry}, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET company = ${company}, industry = ${industry}, updated_at = NOW()
      RETURNING *
    `;
    return res.status(200).json({ profile: result[0] });
  } catch (e) {
    console.error('Save profile error:', e);
    return res.status(500).json({ error: e.message });
  }
}