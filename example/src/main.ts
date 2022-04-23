// import { ViteSSG } from 'vite-ssg'
import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import { createRouter, createWebHistory } from 'vue-router'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'
import App from './App.vue'
// import '@unocss/reset/tailwind.css'
import 'uno.css'

import 'prismjs'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-markup-templating'
App.name = 'Example App'

const routes = setupLayouts(generatedRoutes)
// eslint-disable-next-line no-console
console.log({ generatedRoutes, routes })

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
