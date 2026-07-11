import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { id, name, title, department, annual_salary } = body;

    const sql = neon(process.env.DATABASE_URL);

    if (id) {
      // Update existing employee
      const result = await sql`
        UPDATE employees 
        SET name=${name}, title=${title}, department=${department}, annual_salary=${annual_salary}
        WHERE id=${id}
        RETURNING *
      `;
      return res.status(200).json({ employee: result[0] });
    } else {
      // Insert new employee
      const result = await sql`
        INSERT INTO employees (name, title, department, annual_salary)
        VALUES (${name}, ${title}, ${department}, ${annual_salary})
        RETURNING *
      `;
      return res.status(200).json({ employee: result[0] });
    }
  } catch (e) {
    console.error('Save employee error:', e);
    return res.status(500).json({ error: e.message });
  }
}