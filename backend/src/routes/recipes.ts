import express, { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'
import pool from '../db'
import { findOrCreateUnite } from '../unite'
import { PoolClient } from 'pg'

interface ImportIngredient { id?: string; nom: string; quantite: string; unite: string }
interface ImportRecipe {
  nom: string
  instructions?: string
  ingredient_principal_id?: string
  ingredient_secondaire_id?: string
  image_url?: string
  ingredients?: ImportIngredient[]
}

const router = express.Router();

async function insertRecipe(client: PoolClient, data: ImportRecipe): Promise<string> {
  const {
    nom,
    instructions,
    ingredient_principal_id,
    ingredient_secondaire_id,
    image_url,
    ingredients
  } = data

  if (!nom) {
    throw new Error('Missing required fields')
  }

  let principalId = ingredient_principal_id as string | undefined
  const id = randomUUID()

  if (!principalId) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      throw new Error('Missing required fields')
    }
    const firstIng = ingredients[0]
    let firstId = firstIng.id as string | undefined
    if (!firstId) {
      const newId = randomUUID()
      const uniteId = await findOrCreateUnite(client, firstIng.unite)
      const { rows: ingRows } = await client.query(
        'INSERT INTO ingredients (id, nom, unite_id) VALUES ($1, $2, $3) RETURNING id',
        [newId, firstIng.nom, uniteId]
      )
      firstId = ingRows[0].id
    }
    principalId = firstId
    ingredients[0].id = firstId
  }

  await client.query(
    `INSERT INTO recipes (id, nom, instructions, ingredient_principal_id, ingredient_secondaire_id, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, nom, instructions || null, principalId, ingredient_secondaire_id || null, image_url || null]
  )

  if (Array.isArray(ingredients)) {
    for (const ing of ingredients) {
      let ingredientId = ing.id as string | undefined
      const uniteId = await findOrCreateUnite(client, ing.unite)
      if (!ingredientId) {
        const newId = randomUUID()
        const { rows: ingRows } = await client.query(
          'INSERT INTO ingredients (id, nom, unite_id) VALUES ($1, $2, $3) RETURNING id',
          [newId, ing.nom, uniteId]
        )
        ingredientId = ingRows[0].id
      }
      await client.query(
        'INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, quantite, unite_id) VALUES ($1, $2, $3, $4, $5)',
        [randomUUID(), id, ingredientId, ing.quantite, uniteId]
      )
    }
  }

  return id
}

// GET /recipes - list all recipes
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rows } = await pool.query('SELECT * FROM recipes ORDER BY nom');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /recipes/export - export all recipes with ingredients and units
router.get('/export', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [recipes, ingredients, unites, recipeIngredients] = await Promise.all([
      pool.query('SELECT * FROM recipes ORDER BY nom'),
      pool.query('SELECT * FROM ingredients ORDER BY nom'),
      pool.query('SELECT * FROM unites ORDER BY nom'),
      pool.query('SELECT * FROM recipe_ingredients')
    ])
    res.json({
      recipes: recipes.rows,
      ingredients: ingredients.rows,
      unites: unites.rows,
      recipe_ingredients: recipeIngredients.rows
    })
  } catch (err) {
    next(err)
  }
})

// POST /recipes/import - import recipes from JSON
router.post('/import', async (req: Request, res: Response, next: NextFunction) => {
  const data = req.body
  if (!Array.isArray(data?.recipes)) {
    res.status(400).json({ error: 'Invalid data' })
    return
  }
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const r of data.recipes) {
      const { rows } = await client.query('SELECT 1 FROM recipes WHERE nom = $1', [r.nom])
      if (rows.length === 0) {
        await insertRecipe(client, r)
      }
    }
    await client.query('COMMIT')
    res.status(204).send()
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
})


// GET /recipes/:id - retrieve a single recipe
// GET /recipes/:id/ingredients - list ingredients for a recipe
router.get('/:id/ingredients', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT i.id, i.nom, ri.quantite, u.nom AS unite,
        CASE
          WHEN ri.ingredient_id = r.ingredient_principal_id THEN 0
          WHEN ri.ingredient_id = r.ingredient_secondaire_id THEN 1
          ELSE 2
        END AS ordre
       FROM recipe_ingredients ri
       JOIN ingredients i ON i.id = ri.ingredient_id
       JOIN recipes r ON r.id = ri.recipe_id
       LEFT JOIN unites u ON u.id = ri.unite_id
       WHERE ri.recipe_id = $1
       ORDER BY ordre, i.nom`,
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
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const id = await insertRecipe(client, req.body)
    await client.query('COMMIT')
    const { rows } = await pool.query('SELECT * FROM recipes WHERE id = $1', [id])
    res.status(201).json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
})

// PUT /recipes/:id - update a recipe
router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
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

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let principalId = ingredient_principal_id as string | undefined;
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
        const uniteId = await findOrCreateUnite(client, firstIng.unite);
        const { rows: ingRows } = await client.query(
          'INSERT INTO ingredients (id, nom, unite_id) VALUES ($1, $2, $3) RETURNING id',
          [newId, firstIng.nom, uniteId]
        );
        firstId = ingRows[0].id;
      }
      principalId = firstId;
      ingredients[0].id = firstId;
    }

    const { rows } = await client.query(
      `UPDATE recipes SET nom = $1, instructions = $2, ingredient_principal_id = $3, ingredient_secondaire_id = $4, image_url = $5
       WHERE id = $6 RETURNING *`,
      [nom, instructions || null, principalId, ingredient_secondaire_id || null, image_url || null, id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }

    await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [id]);

      if (Array.isArray(ingredients)) {
        for (const ing of ingredients) {
          let ingredientId = ing.id;
          const uniteId = await findOrCreateUnite(client, ing.unite);
          if (!ingredientId) {
            const newId = randomUUID();
            const { rows: ingRows } = await client.query(
              'INSERT INTO ingredients (id, nom, unite_id) VALUES ($1, $2, $3) RETURNING id',
              [newId, ing.nom, uniteId]
            );
            ingredientId = ingRows[0].id;
          }
          await client.query(
            'INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, quantite, unite_id) VALUES ($1, $2, $3, $4, $5)',
            [randomUUID(), id, ingredientId, ing.quantite, uniteId]
          );
        }
      }

      const { rows: removed } = await client.query(
        `DELETE FROM ingredients i
         WHERE NOT EXISTS (
           SELECT 1 FROM recipes r
           WHERE r.ingredient_principal_id = i.id
              OR r.ingredient_secondaire_id = i.id
         )
         AND NOT EXISTS (
           SELECT 1 FROM recipe_ingredients ri WHERE ri.ingredient_id = i.id
         )
         RETURNING unite_id`
      );
      for (const r of removed) {
        const uId = r.unite_id as string | null;
        if (uId) {
          const { rows: refs } = await client.query(
            'SELECT 1 FROM ingredients WHERE unite_id = $1 LIMIT 1',
            [uId]
          );
          if (refs.length === 0) {
            await client.query('DELETE FROM unites WHERE id = $1', [uId]);
          }
        }
      }

      await client.query('COMMIT');
      res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// DELETE /recipes/:id - remove a recipe
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: ingRows } = await client.query(
      'SELECT ingredient_id FROM recipe_ingredients WHERE recipe_id = $1',
      [id]
    );
    const result = await client.query('DELETE FROM recipes WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }

    for (const r of ingRows) {
      const ingId = r.ingredient_id as string;
      const { rows: refs } = await client.query(
        `SELECT 1 FROM recipes WHERE ingredient_principal_id = $1 OR ingredient_secondaire_id = $1 LIMIT 1
         UNION ALL
         SELECT 1 FROM recipe_ingredients WHERE ingredient_id = $1 LIMIT 1`,
        [ingId]
      );
      if (refs.length === 0) {
        const { rows: uRows } = await client.query('SELECT unite_id FROM ingredients WHERE id = $1', [ingId]);
        await client.query('DELETE FROM ingredients WHERE id = $1', [ingId]);
        const uniteId = uRows[0]?.unite_id as string | null;
        if (uniteId) {
          const { rows: uRefs } = await client.query(
            'SELECT 1 FROM ingredients WHERE unite_id = $1 LIMIT 1',
            [uniteId]
          );
          if (uRefs.length === 0) {
            await client.query('DELETE FROM unites WHERE id = $1', [uniteId]);
          }
        }
      }
    }

    await client.query('COMMIT');
    res.status(204).send();
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;
