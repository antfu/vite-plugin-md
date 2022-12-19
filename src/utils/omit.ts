export function omit<T extends {}, K extends Array<keyof T>>(obj: T, ...removals: K) {
  const untyped = removals as Array<unknown>
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !untyped.includes(key)),
  ) as Omit<T, K[number]>
}
