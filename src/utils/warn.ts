export type WarningCategory = 'builder-api' | 'initialization'

export function warn(category: WarningCategory, message: string) {
  console.warn(`⚠️  [ ${category} ]: ${message}`)
}