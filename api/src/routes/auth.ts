import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

router.post('/signup', async (req, res) => {
  console.log("Signup endpoint hit");
  const { name, email, password, phoneNumber } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    const existing = result.rows[0];
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const insertResult = await pool.query(
      'INSERT INTO "User" (name, email, password, "phoneNumber", role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, password, phoneNumber, 'student']
    );
    const user = insertResult.rows[0];

    return res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token: null,
    });
  } catch (err) {
    console.error('Signup error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  try {
    const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token: null,
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
