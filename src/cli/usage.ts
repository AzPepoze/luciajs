export const USAGE = `Usage:
  lusia build  [dir] [--outdir dist] [--no-minify] [--routes /guide,/reference] [--quiet]
  lusia dev    [dir] [--port 3000] [--quiet]
  lusia format [paths...] [--check] [--quiet]
  lusia lint   [paths...] [--fix] [--max-warnings 0] [--quiet]

  dir       App folder with an index.html and optional lusia.config.json (default: .)
  paths     .lusia files, folders or globs (default: .)
  --outdir  Output folder, relative to the current folder (default: dist)
  --port    Dev server port (default: $PORT or 3000)
  --routes  Client routes that get their own index.html, so deep links load on static hosts
  --check   List the files that would change and exit 1, without writing
  --fix     Apply the safe lint fixes
  --max-warnings  Fail when there are more warnings than this (default: no limit)
  --quiet   Hide the summary output
`;
