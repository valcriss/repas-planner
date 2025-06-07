import express, { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'
import pool from '../db'
import { generateMenuEntries, Selection, RecipeRow } from '../menu'

const router = express.Router()

router.get('/:week', async (req: Request, res: Response, next: NextFunction) => {
  const { week } = req.params
  try {
    const { rows } = await pool.query('SELECT id FROM menus WHERE semaine = $1', [week])
    if (rows.length === 0) {
      res.json({ id: null, semaine: week, recettes: [] })
      return
    }
    const menuId = rows[0].id as string
    const { rows: recs } = await pool.query(
      `SELECT mr.jour, mr.moment, mr.recipe_id, r.nom AS recipe_nom
       FROM menu_recipes mr
       LEFT JOIN recipes r ON r.id = mr.recipe_id
       WHERE mr.menu_id = $1`,
      [menuId]
    )
    res.json({ id: menuId, semaine: week, recettes: recs })
  } catch (err) {
    next(err)
  }
})

router.post('/:week/generate', async (req: Request, res: Response, next: NextFunction) => {
  const { week } = req.params
  const selection: Selection = req.body.selection || {}
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query('SELECT id FROM menus WHERE semaine = $1', [week])
    let menuId: string
    if (rows.length === 0) {
      const id = randomUUID()
      const { rows: r } = await client.query('INSERT INTO menus(id, semaine) VALUES ($1,$2) RETURNING id', [id, week])
      menuId = r[0].id
    } else {
      menuId = rows[0].id
      await client.query('DELETE FROM menu_recipes WHERE menu_id = $1', [menuId])
    }
    const { rows: recs } = await client.query(
      `SELECT r.id, r.ingredient_principal_id, r.ingredient_secondaire_id,
              MAX(m.semaine) AS last_used
       FROM recipes r
       LEFT JOIN menu_recipes mr ON mr.recipe_id = r.id
       LEFT JOIN menus m ON m.id = mr.menu_id
       GROUP BY r.id`
    )
    const entries = generateMenuEntries(recs as RecipeRow[], selection)
    for (const e of entries) {
      if (!e.recipe_id) continue
      await client.query(
        'INSERT INTO menu_recipes(id, menu_id, jour, moment, recipe_id) VALUES ($1,$2,$3,$4,$5)',
        [randomUUID(), menuId, e.jour, e.moment, e.recipe_id]
      )
    }
    await client.query('COMMIT')
    const { rows: recsWithNames } = await client.query(
      `SELECT mr.jour, mr.moment, mr.recipe_id, r.nom AS recipe_nom
       FROM menu_recipes mr
       LEFT JOIN recipes r ON r.id = mr.recipe_id
       WHERE mr.menu_id = $1`,
      [menuId]
    )
    res.json({ id: menuId, semaine: week, recettes: recsWithNames })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
})

router.get('/:week/shopping-list', async (req: Request, res: Response, next: NextFunction) => {
  const { week } = req.params
  try {
    const { rows } = await pool.query(
      `SELECT i.id, i.nom, u.nom AS unite,
              SUM(COALESCE(ri.quantite::numeric,0))::text AS quantite,
              GREATEST(SUM(COALESCE(ri.quantite::numeric,0)) - COALESCE(s.quantite,0),0)::text AS manque
       FROM menus m
       JOIN menu_recipes mr ON mr.menu_id = m.id
       JOIN recipe_ingredients ri ON ri.recipe_id = mr.recipe_id
       JOIN ingredients i ON i.id = ri.ingredient_id
       LEFT JOIN stock s ON s.ingredient_id = i.id
       LEFT JOIN unites u ON u.id = ri.unite_id
       WHERE m.semaine = $1
       GROUP BY i.id, i.nom, u.nom, s.quantite
       ORDER BY i.nom`,
      [week]
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.post('/:week/:jour/:moment/done', async (req: Request, res: Response, next: NextFunction) => {
  const { week, jour, moment } = req.params
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      `SELECT mr.recipe_id FROM menus m
       JOIN menu_recipes mr ON mr.menu_id = m.id
       WHERE m.semaine = $1 AND mr.jour = $2 AND mr.moment = $3`,
      [week, jour, moment]
    )
    if (rows.length === 0 || !rows[0].recipe_id) {
      await client.query('ROLLBACK')
      res.status(404).json({ error: 'Not found' })
      return
    }
    const recipeId = rows[0].recipe_id as string
    const { rows: ings } = await client.query(
      'SELECT ingredient_id, quantite::numeric FROM recipe_ingredients WHERE recipe_id = $1',
      [recipeId]
    )
    for (const r of ings) {
      await client.query(
        `INSERT INTO stock(ingredient_id, quantite)
         VALUES ($1, 0)
         ON CONFLICT (ingredient_id)
         DO UPDATE SET quantite = GREATEST(stock.quantite - $2, 0)`,
        [r.ingredient_id as string, r.quantite]
      )
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

export default router
