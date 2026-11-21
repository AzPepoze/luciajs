/** Indents each line of a section by one unit. Lines that start inside a template literal keep their text. */
export function indentSection(code: string, unit: string): string {
  if (unit === "") return code;
  const insideTemplate = templateLineStarts(code);
  return code
    .split("\n")
    .map((line, index) => indentLine(line, unit, insideTemplate[index] ?? false))
    .join("\n");
}

function indentLine(line: string, unit: string, insideTemplate: boolean): string {
  if (insideTemplate || line.trim() === "") return line;
  return unit + line;
}

type Mode = "code" | "single" | "double" | "template" | "line-comment" | "block-comment";

// For each line, whether it begins inside template literal text.
function templateLineStarts(code: string): boolean[] {
  const starts = [false];
  const modes: Mode[] = ["code"];
  const braceDepths: number[] = [];
  for (let index = 0; index < code.length; index++) {
    const char = code[index]!;
    const next = code[index + 1];
    const mode = modes[modes.length - 1]!;
    if (char === "\n") {
      if (mode === "line-comment") modes.pop();
      starts.push(modes[modes.length - 1] === "template");
      continue;
    }
    if (mode === "line-comment") continue;
    if (mode === "block-comment") {
      if (char === "*" && next === "/") {
        modes.pop();
        index++;
      }
      continue;
    }
    if (mode === "single" || mode === "double" || mode === "template") {
      if (char === "\\") {
        index++;
        continue;
      }
      if (mode === "template" && char === "$" && next === "{") {
        modes.push("code");
        braceDepths.push(0);
        index++;
        continue;
      }
      if (char === closerOf(mode)) modes.pop();
      continue;
    }
    if (char === "/" && next === "/") modes.push("line-comment");
    else if (char === "/" && next === "*") {
      modes.push("block-comment");
      index++;
    } else if (char === "'") modes.push("single");
    else if (char === '"') modes.push("double");
    else if (char === "`") modes.push("template");
    else if (char === "{" && braceDepths.length > 0) braceDepths[braceDepths.length - 1]!++;
    else if (char === "}" && braceDepths.length > 0) closeBrace(modes, braceDepths);
  }
  return starts;
}

function closerOf(mode: "single" | "double" | "template"): string {
  if (mode === "single") return "'";
  if (mode === "double") return '"';
  return "`";
}

function closeBrace(modes: Mode[], braceDepths: number[]): void {
  const depth = braceDepths[braceDepths.length - 1]!;
  if (depth > 0) {
    braceDepths[braceDepths.length - 1] = depth - 1;
    return;
  }
  braceDepths.pop();
  modes.pop();
}
