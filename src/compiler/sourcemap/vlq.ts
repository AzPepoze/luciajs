const DIGITS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const CONTINUATION = 32;
const VALUE_MASK = 31;
const SHIFT = 5;

/** Base64 VLQ, as used in the `mappings` field of a source map. */
export function encodeVlq(value: number): string {
  let bits = value < 0 ? (-value << 1) | 1 : value << 1;
  let out = "";
  do {
    let digit = bits & VALUE_MASK;
    bits >>>= SHIFT;
    if (bits > 0) digit |= CONTINUATION;
    out += DIGITS[digit];
  } while (bits > 0);
  return out;
}
