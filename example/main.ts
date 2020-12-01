import { createApp } from 'vue'
import App from './App.vue'
import Counter from './Counter.vue'

const app = createApp(App)

app.component('Counter', Counter)

app.mount('#app')
