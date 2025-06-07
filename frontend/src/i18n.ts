import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import fr from './locales/fr.json'
/* global navigator, document */

export const messages = { en, fr }

export function setupI18n() {
  const user = navigator.language.split('-')[0]
  const locale = user in messages ? user : 'en'
  const i18n = createI18n({ legacy: false, locale, fallbackLocale: 'en', messages })
  document.documentElement.lang = locale
  return i18n
}
