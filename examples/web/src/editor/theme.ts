import { EditorView } from "@codemirror/view";

// Colours are the site's CSS variables, so the editor follows light and dark mode with the page.
export const editorTheme = EditorView.theme({
  "&": { color: "var(--fg)", backgroundColor: "var(--code)" },
  ".cm-content": { caretColor: "var(--accent)", padding: "0.6rem 0" },
  "&.cm-focused": { outline: "none" },
  ".cm-gutters": { backgroundColor: "var(--code)", color: "var(--muted)", border: "none" },
  ".cm-activeLine": { backgroundColor: "var(--accent-soft)" },
  ".cm-activeLineGutter": { backgroundColor: "var(--accent-soft)", color: "var(--fg)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "var(--lavender-soft)",
  },
  ".cm-matchingBracket": { backgroundColor: "var(--lavender-soft)", color: "inherit" },
  ".cm-searchMatch": { backgroundColor: "var(--swipe)", outline: "none" },
  ".cm-searchMatch-selected": { backgroundColor: "var(--accent-soft)" },
  ".cm-panels": { backgroundColor: "var(--card)", color: "var(--fg)", borderColor: "var(--line)" },
  ".cm-panel button": { color: "var(--fg)" },
  ".cm-tooltip": {
    backgroundColor: "var(--card)",
    border: "2px solid var(--line)",
    borderRadius: "12px",
    color: "var(--fg)",
    boxShadow: "var(--shadow)",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "var(--accent-soft)",
    color: "var(--fg)",
  },
  ".cm-lintRange-error": {
    backgroundImage: "none",
    textDecoration: "underline wavy var(--accent)",
  },
  ".cm-lintRange-warning": {
    backgroundImage: "none",
    textDecoration: "underline wavy var(--tok-number)",
  },
  ".lucia-flow": { color: "var(--tok-flow)" },
  ".lucia-component": { color: "var(--tok-component)" },
  ".lucia-event": { color: "var(--tok-event)" },
  ".lucia-bind": { color: "var(--tok-bind)" },
  ".lucia-animate": { color: "var(--tok-animate)" },
  ".editor-docs": { padding: "0.6rem 0.8rem", maxWidth: "24rem", fontSize: "0.85rem" },
  ".editor-docs p, .editor-docs ul": { margin: "0.3rem 0" },
  ".editor-docs pre": { margin: "0.4rem 0", padding: "0.4rem 0.5rem", borderRadius: "8px" },
  ".editor-docs pre, .editor-docs code": { backgroundColor: "var(--code)" },
});
