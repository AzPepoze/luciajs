# Selector-scoping benchmark results

- Date: 2026-11-19
- Elements per page: N = 1000 components (~20000 elements)
- Rules: R = 300 random class rules plus fixed rules
- Runs: 10 per browser and variant (plus one unmeasured warm-up)
- Restyle: 50 body class toggles, forced style after each
- Browser versions:
  - Chromium: 157.0.8103.78
  - Firefox: 155.0

## Fixes to the first draft

- Variant C scope start is `([data-l]:not([data-l="child"]))`. A plain `([data-l])` made each child root its own scope root, so the child span was still styled.
- Variant C mode rules are `.mode-b :scope <target>`. Inside `@scope`, a selector with no `:scope` or `&` is implicitly prefixed with `:scope `, so `.mode-b h1` never matched (body is outside the scope root). The first draft's C restyle numbers were invalid and are discarded.

## Results

Only variants where every run passes all checks appear here.

| browser | variant | initial median/p90 (ms) | restyle median/p90 (ms, 50 toggles) | CSS bytes |
|---|---|---|---|---|
| Chromium | A | 239.9 / 255.8 | 1589.7 / 1638.2 | 17976 |
| Chromium | B | 234.9 / 250.5 | 2990.7 / 3182.9 | 21166 |
| Chromium | C | 256.9 / 277.3 | 1703.4 / 1763.6 | 18126 |
| Firefox | A | 152.5 / 186.0 | 1737.0 / 1840.0 | 17976 |
| Firefox | B | 158.5 / 162.0 | 1686.5 / 1738.0 | 21166 |
| Firefox | C | 157.5 / 165.0 | 2172.0 / 2237.0 | 18126 |

## Correctness checks

Per run: h1 color; child span styled in A and B, not in C; `body.mode-b` sets h1 font-weight 800 and p letter-spacing 1px; both revert when the class is removed.

| browser | variant | status | detail |
|---|---|---|---|
| Chromium | A | pass | all 10 runs |
| Chromium | B | pass | all 10 runs |
| Chromium | C | pass | all 10 runs |
| Firefox | A | pass | all 10 runs |
| Firefox | B | pass | all 10 runs |
| Firefox | C | pass | all 10 runs |
