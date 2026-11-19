const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

export function fnv1a(input: string): number {
  let h = FNV_OFFSET_BASIS;
  for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), FNV_PRIME);
  return h >>> 0;
}

export function hash(input: string): string {
  return fnv1a(input).toString(36);
}
