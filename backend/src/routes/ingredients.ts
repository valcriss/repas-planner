import express, { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import pool from '../db';

const router = express.Router();

// GET /ingredients - search ingredients by name
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const search = (req.query.search as string) || '';
  try {
    const { rows } = await pool.query(
      'SELECT * FROM ingredients WHERE nom ILIKE $1 ORDER BY nom LIMIT 10',
      [`%${search}%`]
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
  try {
    const { rows } = await pool.query(
      'INSERT INTO ingredients (id, nom, unite) VALUES ($1, $2, $3) RETURNING *',
      [id, nom, unite || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
