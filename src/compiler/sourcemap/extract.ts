import { encodeVlq } from "./vlq.ts";

const MARKER = /\/\*@(\d+):(\d+)\*\//g;

interface Segment {
  /** 0-based column in the generated line. */
  column: number;
  /** 0-based line and column in the .lucia source. */
  sourceLine: number;
  sourceColumn: number;
}

export interface Extracted {
  code: string;
  /** A version 3 source map, as JSON. */
  map: string;
}

/** Removes the markers from generated code and returns the source map that they describe. */
export function extractSourceMap(generated: string, file: string, source: string): Extracted {
  const codeLines: string[] = [];
  const lineSegments: Segment[][] = [];
  for (const line of generated.split("\n")) {
    const stripped = stripLine(line);
    codeLines.push(stripped.code);
    lineSegments.push(stripped.segments);
  }
  const map = {
    version: 3,
    sources: [file],
    sourcesContent: [source],
    names: [],
    mappings: encodeMappings(lineSegments),
  };
  return { code: codeLines.join("\n"), map: JSON.stringify(map) };
}

function stripLine(line: string): { code: string; segments: Segment[] } {
  let code = "";
  let last = 0;
  const segments: Segment[] = [];
  for (const match of line.matchAll(MARKER)) {
    code += line.slice(last, match.index);
    segments.push({
      column: code.length,
      sourceLine: Number(match[1]) - 1,
      sourceColumn: Number(match[2]) - 1,
    });
    last = match.index! + match[0].length;
  }
  return { code: code + line.slice(last), segments };
}

/** Each field is relative to the one before it: the generated column per line, the source position across the file. */
function encodeMappings(lines: Segment[][]): string {
  let sourceLine = 0;
  let sourceColumn = 0;
  return lines
    .map((segments) => {
      let column = 0;
      return segments
        .map((segment) => {
          const fields = [
            segment.column - column,
            0,
            segment.sourceLine - sourceLine,
            segment.sourceColumn - sourceColumn,
          ];
          column = segment.column;
          sourceLine = segment.sourceLine;
          sourceColumn = segment.sourceColumn;
          return fields.map(encodeVlq).join("");
        })
        .join(",");
    })
    .join(";");
}
