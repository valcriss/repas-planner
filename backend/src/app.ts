import express from 'express';
import dotenv from 'dotenv';
import recipeRoutes from './routes/recipes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/recipes', recipeRoutes);

app.get('/', (req, res) => {
  res.send('Repas Planner API');
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

export default app;
