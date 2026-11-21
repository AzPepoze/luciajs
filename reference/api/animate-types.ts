import type { ApiEntry } from "./types.ts";

export const animateTypeEntries: ApiEntry[] = [
	{
		id: "animate-type",
		name: "Animate",
		kind: "type",
		group: "motion",
		signature:
			"type Animate = Keyframes | AnimateItem | (Keyframes | AnimateItem)[]",
		summary: "The value of the animate attribute.",
		bullets: [
			"A bare Keyframes object is shorthand for { style: it }.",
			"An array plays each item on its own trigger.",
			"Same-property conflicts: the later item wins.",
		],
		example: `import type { Animate } from "lusia";\n\nconst value: Animate = [fadeIn, { style: glow, when: WHEN.HOVER }];`,
	},
	{
		id: "keyframes-type",
		name: "Keyframes",
		kind: "type",
		group: "motion",
		signature:
			"type Keyframes = { default?: DefaultEasing } & Record<number, Style | [EaseStyle, Ease, Style] | [EaseStyle, Style] | [Ease, Style]>",
		summary: "The keys of one animation. Each key sets its styles, and optionally its easing.",
		bullets: [
			"Keys are numbers from 0 to 1, and must include 0 and 1.",
			"A key is { css } (the defaults apply), [ease, { css }], [EASE.STYLE.x, { css }] or [EASE.STYLE.x, ease, { css }].",
			"default: [EASE.STYLE.x, ease], [EASE.STYLE.x] or [ease] sets the easing for keys that do not set their own.",
			"Precedence per part: the key, then the keyframes default, then the engine default (QUART + INOUT).",
			"Style is a record of CSS properties in camelCase, such as backgroundColor. Custom properties start with --.",
		],
		example: `import { EASE, type Keyframes } from "lusia";\n\nconst fade: Keyframes = {\n  default: [EASE.STYLE.QUART, EASE.OUT],\n  0: { opacity: 0 },\n  0.5: [EASE.IN, { opacity: 0.8 }],\n  1: { opacity: 1 },\n};`,
	},
	{
		id: "preset",
		name: "PRESET",
		kind: "value",
		group: "motion",
		signature:
			"const PRESET: { readonly FADE: Keyframes; ...; readonly FLIP: Keyframes }",
		summary: "Ready-made keyframes for common motion.",
		bullets: [
			"Use one as the style: animate={PRESET.FADE} plays once on attach.",
			"Each preset uses translate, scale and rotate, so it combines with the element's own transform.",
			"Spread one to change it: { ...PRESET.FADE, 1: { opacity: 0.5 } }.",
			"Each preset has its own default: CUBIC and OUT. A key in a spread can still set its own.",
		],
		example: `import { WHEN, PRESET } from "lusia";\n\n<section animate={{ style: PRESET.SLIDE_UP, when: WHEN.VIEW, duration: 500 }}>...</section>`,
		members: [
			{ name: "FADE", summary: "Fades in from transparent." },
			{
				name: "SLIDE_UP",
				summary: "Comes up from below, moving up 24px into place while fading in.",
			},
			{
				name: "SLIDE_DOWN",
				summary: "Comes down from above, moving down 24px into place while fading in.",
			},
			{
				name: "SLIDE_LEFT",
				summary: "Comes in from the left, moving right 24px into place while fading in.",
			},
			{
				name: "SLIDE_RIGHT",
				summary: "Comes in from the right, moving left 24px into place while fading in.",
			},
			{ name: "POP", summary: "Grows from 80% size while fading in." },
			{ name: "ZOOM", summary: "Grows from nothing to full size." },
			{
				name: "SHAKE",
				summary: "Shakes sideways 10px, then settles.",
			},
			{ name: "PULSE", summary: "Grows to 110% and back." },
			{ name: "SPIN", summary: "One full turn." },
			{
				name: "FLIP",
				summary: "Turns into view around the vertical axis while fading in.",
			},
		],
	},
	{
		id: "interpolate",
		name: "interpolate()",
		kind: "function",
		group: "motion",
		signature:
			"interpolate(from: unknown, to: unknown): (t: number) => unknown",
		summary: "Blends two values. The same engine that animate uses.",
		bullets: [
			"Handles numbers, strings with units and colors, arrays and plain objects.",
			"Returns a function: call it with t from 0 to 1.",
			"Values that cannot blend switch at the middle.",
		],
		example: `import { interpolate } from "lusia";\n\nconst mix = interpolate("0px", "100px");\nmix(0.5); // "50px"`,
	},
];
