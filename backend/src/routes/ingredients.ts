import express, { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import pool from '../db';
import { findOrCreateUnite } from '../unite';

const router = express.Router();

// GET /ingredients - search ingredients by name
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const search = (req.query.search as string) || '';
  try {
    const { rows } = await pool.query(
      `SELECT i.id, i.nom, u.nom AS unite
       FROM ingredients i
       LEFT JOIN unites u ON u.id = i.unite_id
       WHERE i.nom ILIKE $1
       ORDER BY i.nom
       LIMIT 10`,
      [`%${search}%`]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /ingredients/all - list all ingredients
router.get('/all', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rows } = await pool.query(
      `SELECT i.id, i.nom, u.nom AS unite
       FROM ingredients i
       LEFT JOIN unites u ON u.id = i.unite_id
       ORDER BY i.nom`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /ingredients - create a new ingredient
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { nom, unite } = req.body;
  if (!nom) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  const id = randomUUID();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const uniteId = await findOrCreateUnite(client, unite);
    await client.query(
      'INSERT INTO ingredients (id, nom, unite_id) VALUES ($1, $2, $3)',
      [id, nom, uniteId]
    );
    await client.query('COMMIT');
    res.status(201).json({ id, nom, unite: unite || null });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;
