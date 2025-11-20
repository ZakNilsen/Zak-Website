/**
 * Deterministic random number generator
 * Ensures SSR and client generate identical values
 */
export function makeRNG(seed: number) {
  return function random() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}
