import express, { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import pool from '../db';

const router = express.Router();

// GET /recipes - list all recipes
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rows } = await pool.query('SELECT * FROM recipes ORDER BY nom');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /recipes/:id - retrieve a single recipe
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /recipes - create a new recipe
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { nom, instructions, ingredient_principal_id, ingredient_secondaire_id, image_url } = req.body;
  if (!nom || !ingredient_principal_id) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  const id = randomUUID();
  try {
    const { rows } = await pool.query(
      `INSERT INTO recipes (id, nom, instructions, ingredient_principal_id, ingredient_secondaire_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, nom, instructions || null, ingredient_principal_id, ingredient_secondaire_id || null, image_url || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /recipes/:id - update a recipe
router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { nom, instructions, ingredient_principal_id, ingredient_secondaire_id, image_url } = req.body;
  if (!nom || !ingredient_principal_id) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  try {
    const { rows } = await pool.query(
      `UPDATE recipes SET nom = $1, instructions = $2, ingredient_principal_id = $3, ingredient_secondaire_id = $4, image_url = $5
       WHERE id = $6 RETURNING *`,
      [nom, instructions || null, ingredient_principal_id, ingredient_secondaire_id || null, image_url || null, id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /recipes/:id - remove a recipe
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM recipes WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
