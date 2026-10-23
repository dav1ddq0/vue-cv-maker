import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { readPrefs } from '@/services/prefs'
import './styles/app.css'
import './styles/print.css'

document.documentElement.lang = readPrefs().uiLanguage
document.documentElement.dataset.theme = readPrefs().theme

createApp(App).use(createPinia()).mount('#app')
