export function getVueVersion(defaultVersion = '3.2.0') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let v = require('vue')
    if (v.default)
      v = v.default
    return v.version || defaultVersion
  }
  catch (e) {
    return defaultVersion
  }
}
