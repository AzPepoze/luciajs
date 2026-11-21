const LENGTH_UNITS = new Set(
  "px em rem ex ch lh rlh cm mm in pt pc q % vw vh vi vb vmin vmax svw svh svi svb svmin svmax lvw lvh lvi lvb lvmin lvmax dvw dvh dvi dvb dvmin dvmax cqw cqh cqi cqb cqmin cqmax".split(
    " ",
  ),
);

/** Units that measure a length, so two of them can blend through calc(). */
export function isLength(unit: string): boolean {
  return LENGTH_UNITS.has(unit.toLowerCase());
}
