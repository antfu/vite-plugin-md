// import { ViteSSG } from 'vite-ssg'
import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import { createRouter, createWebHistory } from 'vue-router'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'
import App from './App.vue'
import './styles/main.css'
import 'uno.css'

App.name = 'Example App'

const routes = setupLayouts(generatedRoutes)

const app = createApp(App)
const head = createHead()
const router = createRouter({
  history: createWebHistory(),
  routes,
})

app.use(head)
app.use(router)
app.mount('#app')

// export const createApp = ViteSSG(
//   App,
//   { routes, base: import.meta.env.BASE_URL },
//   (ctx) => {
//     // install all modules under `modules/`
//     Object.values(import.meta.globEager('./modules/*.ts')).forEach(i => i.install?.(ctx))
//   },
// )
