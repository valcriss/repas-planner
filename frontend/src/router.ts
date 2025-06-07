import { createRouter, createWebHistory } from 'vue-router'
import RecipesPage from './pages/RecipesPage.vue'
import AddRecipePage from './pages/AddRecipePage.vue'
import RecipeDetailPage from './pages/RecipeDetailPage.vue'
import MenuPage from './pages/MenuPage.vue'
import LoginPage from './pages/LoginPage.vue'
import StockPage from './pages/StockPage.vue'
import { checkAuthRequired } from './api'

export const routes = [
  { path: '/', redirect: '/recipes' },
  { path: '/recipes', component: RecipesPage },
  { path: '/recipes/:id', component: RecipeDetailPage },
  { path: '/recipes/:id/edit', component: AddRecipePage },
  { path: '/recipes/add', component: AddRecipePage },
  { path: '/menu', component: MenuPage },
  { path: '/stock', component: StockPage },
  { path: '/login', component: LoginPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/* global localStorage */
let authNeeded: boolean | null = null
router.beforeEach(async (to) => {
  if (authNeeded === null) {
    authNeeded = (await checkAuthRequired()).required
  }
  if (!authNeeded) return true
  if (to.path === '/login') return true
  if (localStorage.getItem('loggedIn') === '1') return true
  return '/login'
})

export default router
