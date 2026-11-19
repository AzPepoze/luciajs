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

## Variants

| variant | scoping | child span styled |
|---|---|---|
| A | unscoped | yes |
| B | attribute stamp on every element | yes |
| C | native `@scope` with donut stop | no |
| D | ancestor prefix `[data-l]:not([data-l="child"])`, no stop | yes |
| E | ancestor prefix with a stop inside child roots | no |

## Results

Only variants where every run passes all checks appear here.

E and a fresh A baseline were measured in a separate session (`--variants=A,E`, 10 runs). Those rows are labelled and are not directly comparable with the full run above.

| browser | variant | initial median/p90 (ms) | restyle median/p90 (ms, 50 toggles) | CSS bytes |
|---|---|---|---|---|
| Chromium | A | 245.8 / 273.0 | 1611.2 / 1745.3 | 17976 |
| Chromium | B | 246.5 / 283.9 | 3246.9 / 3413.7 | 21166 |
| Chromium | C | 252.9 / 272.9 | 1712.6 / 1734.2 | 18126 |
| Chromium | D | 249.0 / 264.8 | 1679.6 / 1753.5 | 27865 |
| Chromium | A (fresh baseline, separate session) | 232.0 / 238.0 | 1534.2 / 1551.9 | 17976 |
| Chromium | E (separate session) | 245.7 / 248.8 | 1705.3 / 1743.4 | 40136 |
| Firefox | A | 153.0 / 160.0 | 1681.5 / 1713.0 | 17976 |
| Firefox | B | 166.0 / 172.0 | 1735.0 / 1789.0 | 21166 |
| Firefox | C | 158.0 / 181.0 | 2188.5 / 2220.0 | 18126 |
| Firefox | D | 154.0 / 165.0 | 2091.5 / 2150.0 | 27865 |
| Firefox | A (fresh baseline, separate session) | 151.5 / 157.0 | 1663.0 / 1715.0 | 17976 |
| Firefox | E (separate session) | 152.5 / 157.0 | 2019.0 / 2033.0 | 40136 |

## Correctness checks

Per run: h1 color; child span styled where the Variants table says yes; `body.mode-b` sets h1 font-weight 800 and p letter-spacing 1px; both revert when the class is removed.

| browser | variant | status | detail |
|---|---|---|---|
| Chromium | A | pass | all 10 runs |
| Chromium | B | pass | all 10 runs |
| Chromium | C | pass | all 10 runs |
| Chromium | D | pass | all 10 runs |
| Chromium | E | pass | all 10 runs (separate session) |
| Chromium | A (fresh baseline) | pass | all 10 runs (separate session) |
| Firefox | A | pass | all 10 runs |
| Firefox | B | pass | all 10 runs |
| Firefox | C | pass | all 10 runs |
| Firefox | D | pass | all 10 runs |
| Firefox | E | pass | all 10 runs (separate session) |
| Firefox | A (fresh baseline) | pass | all 10 runs (separate session) |

## Notes

- E wraps its stop in `:where()`, so the stop adds no specificity. A plain `:not()` stop raised class rules to (0,5,0), above the mode rule at (0,4,2), and failed the h1 font-weight check.

## Rerun of A, B and C (same session, 2026-11-19)

Run to check whether the B and C gaps were noise. They were not: the ratios match the earlier runs.

| browser | variant | initial median/p90 (ms) | restyle median/p90 (ms, 50 toggles) | restyle vs A |
|---|---|---|---|---|
| Chromium | A | 227.8 / 236.0 | 1532.5 / 1573.3 | +0% |
| Chromium | B | 238.2 / 250.3 | 3046.8 / 3100.8 | +99% |
| Chromium | C | 239.0 / 245.1 | 1662.2 / 1689.1 | +8% |
| Firefox | A | 155.5 / 165.0 | 1734.0 / 1925.0 | +0% |
| Firefox | B | 161.5 / 178.0 | 1791.0 / 1950.0 | +3% |
| Firefox | C | 163.5 / 165.0 | 2246.5 / 2320.0 | +30% |
