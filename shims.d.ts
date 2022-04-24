
import type { ComponentOptions } from 'vue'
declare module '*.vue' {
  const Component: ComponentOptions
  export default Component
}

declare module '*.md' {
  const Component: ComponentOptions
  export default Component
}
