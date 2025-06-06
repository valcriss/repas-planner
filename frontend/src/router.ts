import { createRouter, createWebHistory } from 'vue-router'
import RecipesPage from './pages/RecipesPage.vue'
import MenuPage from './pages/MenuPage.vue'

export const routes = [
  { path: '/', redirect: '/recipes' },
  { path: '/recipes', component: RecipesPage },
  { path: '/menu', component: MenuPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
