export const USAGE = `Usage:
  lucia build [dir] [--outdir dist] [--no-minify] [--routes /guide,/reference] [--quiet]
  lucia dev   [dir] [--port 3000] [--quiet]

  dir       App folder with an index.html (default: .)
  --outdir  Output folder, relative to the current folder (default: dist)
  --port    Dev server port (default: $PORT or 3000)
  --routes  Client routes that get their own index.html, so deep links load on static hosts
  --quiet   Hide the timing output (step table and per-rebuild lines)
`;
