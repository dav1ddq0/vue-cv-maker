import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { readPrefs } from '@/services/prefs'
import { resolveTheme, systemPrefersDark } from '@/core/theme'
import './styles/app.css'
import './styles/print.css'

document.documentElement.lang = readPrefs().uiLanguage
document.documentElement.dataset.theme = resolveTheme(readPrefs().theme, systemPrefersDark())

createApp(App).use(createPinia()).mount('#app')
