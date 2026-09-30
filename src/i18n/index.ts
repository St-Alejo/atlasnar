import dict from "./es.json";

export type Dict = typeof dict;

/** Returns the full Spanish UI dictionary. */
export function t(): Dict {
  return dict;
}

/** Helper to get a nested key with type safety: t2("herbarium.title") */
export function t2<K1 extends keyof Dict>(section: K1): Dict[K1] {
  return dict[section];
}
