import express, { Request, Response, NextFunction } from 'express'
import pool from '../db'

const router = express.Router()

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      `SELECT i.id, i.nom, u.nom AS unite, COALESCE(s.quantite,0)::text AS quantite
       FROM ingredients i
       LEFT JOIN stock s ON s.ingredient_id = i.id
       LEFT JOIN unites u ON u.id = i.unite_id
       ORDER BY i.nom`
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const { quantite } = req.body
  try {
    await pool.query(
      `INSERT INTO stock(ingredient_id, quantite)
       VALUES ($1, $2)
       ON CONFLICT (ingredient_id)
       DO UPDATE SET quantite = EXCLUDED.quantite`,
      [id, quantite]
    )
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
