import type { BuilderDependency } from '@yankeeinlondon/builder-api'
import { transformer } from '../utils'

/**
 * Ensures that any builders which have expressed dependencies on other Builders
 * will have this dependency available.
 */
export const addBuilderDependencies = (deps: BuilderDependency[]) => transformer('addDependencies', 'initialize', 'initialize', (p) => {
  const depNames = deps.map(([d, _o]) => d.name)
  const configuredNames = p.options.builders.map(b => b.name)
  const missing = depNames.filter(d => !configuredNames.includes(d))

  // missing deps who's need arises from a BuilderAPI exclusively
  missing.forEach((dep) => {
    const [builder, options] = deps.find(([d, _o]) => d.name === dep) as BuilderDependency
    // missing deps have no contention for how to set options on these deps
    p.options.builders.push(builder(options) as any)
  })

  // handle overlaps where a Builder API depends on a builder which was
  // already being configured by the end user

  return p
})
