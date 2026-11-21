export function closestName(word: string, names: readonly string[]): string | undefined {
  const limit = Math.max(1, Math.floor(word.length / 2));
  let best: string | undefined;
  let bestDistance = limit + 1;
  for (const name of names) {
    const distance = editDistance(word, name);
    if (distance < bestDistance) {
      best = name;
      bestDistance = distance;
    }
  }
  return best;
}

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const replace = previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(previous[j]! + 1, current[j - 1]! + 1, replace);
    }
    previous = current;
  }
  return previous[b.length]!;
}
