import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import recipeRoutes from './routes/recipes';
import ingredientRoutes from './routes/ingredients';
import uniteRoutes from './routes/unites';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use('/recipes', recipeRoutes);
app.use('/ingredients', ingredientRoutes);
app.use('/unites', uniteRoutes);

app.get('/', (req, res) => {
  res.send('Repas Planner API');
});

/* c8 ignore next 5 */
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

export default app;
