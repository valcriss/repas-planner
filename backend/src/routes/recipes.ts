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
// GET /recipes/:id/ingredients - list ingredients for a recipe
router.get('/:id/ingredients', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT i.id, i.nom, ri.quantite, ri.unite
       FROM recipe_ingredients ri
       JOIN ingredients i ON i.id = ri.ingredient_id
       WHERE ri.recipe_id = $1
       ORDER BY i.nom`,
      [id]
    );
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
  const {
    nom,
    instructions,
    ingredient_principal_id,
    ingredient_secondaire_id,
    image_url,
    ingredients
  } = req.body;

  if (!nom) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  let principalId = ingredient_principal_id as string | undefined;
  const id = randomUUID();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (!principalId) {
      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        res.status(400).json({ error: 'Missing required fields' });
        await client.query('ROLLBACK');
        return;
      }
      let firstIng = ingredients[0];
      let firstId = firstIng.id as string | undefined;
      if (!firstId) {
        const newId = randomUUID();
        const { rows: ingRows } = await client.query(
          'INSERT INTO ingredients (id, nom, unite) VALUES ($1, $2, $3) RETURNING id',
          [newId, firstIng.nom, firstIng.unite]
        );
        firstId = ingRows[0].id;
      }
      principalId = firstId;
      ingredients[0].id = firstId;
    }

    const { rows } = await client.query(
      `INSERT INTO recipes (id, nom, instructions, ingredient_principal_id, ingredient_secondaire_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, nom, instructions || null, principalId, ingredient_secondaire_id || null, image_url || null]
    );

    if (Array.isArray(ingredients)) {
      for (const ing of ingredients) {
        let ingredientId = ing.id;
        if (!ingredientId) {
          const newId = randomUUID();
          const { rows: ingRows } = await client.query(
            'INSERT INTO ingredients (id, nom, unite) VALUES ($1, $2, $3) RETURNING id',
            [newId, ing.nom, ing.unite]
          );
          ingredientId = ingRows[0].id;
        }
        await client.query(
          'INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, quantite, unite) VALUES ($1, $2, $3, $4, $5)',
          [randomUUID(), id, ingredientId, ing.quantite, ing.unite]
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
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
