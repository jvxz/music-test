/** https://docs.tsafe.dev/objectKeys */
export function objectKeys<T extends Record<string, unknown>>(o: T): (keyof T)[] {
  return Object.keys(o) as any
}

/** https://docs.tsafe.dev/objectFromEntries */
export function objectFromEntries<Entry extends readonly [string, any]>(
  entries: readonly Entry[],
): { [Key in Entry[0]]: Extract<Entry, readonly [Key, any]>[1] } {
  return Object.fromEntries(entries) as any
}

/** Return type of objectFromEntries https://docs.tsafe.dev/objectFromEntries */
export type ObjectFromEntries<Entry extends readonly [string, any]> = {
  [Key in Entry[0]]: Extract<Entry, readonly [Key, any]>[1]
}

/** https://docs.tsafe.dev/objectentries */
export function objectEntries<O extends Record<string, any>>(
  o: O,
): Exclude<{ [Key in keyof O]: [Key, O[Key]] }[keyof O], undefined>[] {
  return Object.entries(o) as any
}

/** Return type of objectEntries https://docs.tsafe.dev/objectentries */
export type ObjectEntries<O extends Record<string, any>> = Exclude<
  { [Key in keyof O]: [Key, O[Key]] }[keyof O],
  undefined
>[]
