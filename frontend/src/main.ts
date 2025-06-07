import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { setupI18n } from './i18n'

const i18n = setupI18n()
createApp(App).use(router).use(i18n).mount('#app')
