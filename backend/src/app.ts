import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import recipeRoutes from './routes/recipes';
import ingredientRoutes from './routes/ingredients';
import uniteRoutes from './routes/unites';
import menuRoutes from './routes/menus';
import stockRoutes from './routes/stock';
import {
  authMiddleware,
  loginRoute,
  logoutRoute,
  authRequiredInfo
} from './auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, 'public');

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.post('/api/login', loginRoute);
app.post('/api/logout', logoutRoute);
app.get('/api/auth-required', authRequiredInfo);
app.use('/api', authMiddleware);
app.use(express.static(frontendPath));
app.use('/api/recipes', recipeRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/unites', uniteRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/menus', menuRoutes);

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

/* c8 ignore next 5 */
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

export default app;
