import express from 'express';
import pool from '../db';
import { randomUUID } from 'crypto';

const router = express.Router();

// GET /recipes
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM recipes');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /recipes
router.post('/', async (req, res, next) => {
  const { nom, instructions, ingredient_principal_id, ingredient_secondaire_id } = req.body;
  const id = randomUUID();
  try {
    const query = `INSERT INTO recipes (id, nom, instructions, ingredient_principal_id, ingredient_secondaire_id)
                   VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [id, nom, instructions, ingredient_principal_id, ingredient_secondaire_id];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
