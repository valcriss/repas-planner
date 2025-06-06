import { createRouter, createWebHistory } from 'vue-router'
import RecipesPage from './pages/RecipesPage.vue'
import AddRecipePage from './pages/AddRecipePage.vue'
import MenuPage from './pages/MenuPage.vue'

export const routes = [
  { path: '/', redirect: '/recipes' },
  { path: '/recipes', component: RecipesPage },
  { path: '/recipes/add', component: AddRecipePage },
  { path: '/menu', component: MenuPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
