import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${userId}
    `;
    return res.status(200).json({ profile: result[0] || null });
  } catch (e) {
    console.error('Get profile error:', e);
    return res.status(500).json({ error: e.message });
  }
}