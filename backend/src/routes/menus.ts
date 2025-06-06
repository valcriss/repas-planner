import express, { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'
import pool from '../db'
import { generateMenuEntries, Selection } from '../menu'

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
    const { rows: recs } = await client.query('SELECT id, ingredient_principal_id, ingredient_secondaire_id FROM recipes')
    const entries = generateMenuEntries(recs, selection)
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
              SUM(COALESCE(ri.quantite::numeric,0))::text AS quantite
       FROM menus m
       JOIN menu_recipes mr ON mr.menu_id = m.id
       JOIN recipe_ingredients ri ON ri.recipe_id = mr.recipe_id
       JOIN ingredients i ON i.id = ri.ingredient_id
       LEFT JOIN unites u ON u.id = ri.unite_id
       WHERE m.semaine = $1
       GROUP BY i.id, i.nom, u.nom
       ORDER BY i.nom`,
      [week]
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

export default router
