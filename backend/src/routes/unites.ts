import express, { Request, Response, NextFunction } from 'express';
import pool from '../db';

const router = express.Router();

// GET /unites - search units by name
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const search = (req.query.search as string) || '';
  try {
    const { rows } = await pool.query(
      `SELECT id, nom
       FROM unites
       WHERE nom ILIKE $1
       ORDER BY nom
       LIMIT 10`,
      [`%${search}%`]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /unites/all - list all units
router.get('/all', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nom
       FROM unites
       ORDER BY nom`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;

