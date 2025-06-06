import express from 'express';

const router = express.Router();

// GET /recipes
router.get('/', (req, res) => {
  res.json({ message: 'Liste des recettes (à implémenter)' });
});

// POST /recipes
router.post('/', (req, res) => {
  const recette = req.body;
  // TODO: validation + insertion en base
  res.status(201).json({ message: 'Recette créée', recette });
});

export default router;