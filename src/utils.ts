export function toArray<T>(n: T | T[]): T[] {
  if (!Array.isArray(n))
    return [n]
  return n
}
