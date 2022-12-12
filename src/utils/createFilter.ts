// Picomatch is CJS only and causing conflicts so I am implementing a handler of the `FilterPattern` temporarily here

export type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp | null

function test(value: string, tst: string | RegExp): boolean {
  return typeof tst === 'string' ? value === tst : tst.test(value)
}

export function createFilter(include: FilterPattern, exclude?: FilterPattern) {
  const includeArr = Array.isArray(include)
    ? include as ReadonlyArray<string | RegExp>
    : include === null ? [] : [include] as ReadonlyArray<string | RegExp>

  const excludeArr = Array.isArray(exclude)
    ? exclude as ReadonlyArray<string | RegExp>
    : !exclude || exclude === null ? [] : [exclude] as ReadonlyArray<string | RegExp>

  return (val: string) => includeArr.some(t => test(val, t)) && !excludeArr.some(t => test(val, t))
}
