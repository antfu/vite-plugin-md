import { createApp } from 'vue'
import App from './App.vue'
import Counter from './Counter.vue'

import 'prismjs'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-markup-templating'

const app = createApp(App)

app.component('Counter', Counter)

app.mount('#app')
